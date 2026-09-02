import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Metadata, RawGraphEntity, ContentCounts } from "../../types/types";
import { useMetadataApi } from "../../api/metadataApi";
import {
  processOverview,
  processAIReady,
  processComplianceEthics,
  OverviewData,
  AIReadyData,
  ComplianceEthicsData,
} from "../../utils/metadataProcessing";
import ConfigurableMetadataTable from "../../components/Tables/ConfigurableMetadataTable";
import { MetadataProperty } from "../../types/metadataPropertyLists";
import AdditionalPropertiesSection from "../../components/Sections/AdditionalPropertiesSection";
import ComplianceEthicsSection from "../../components/Sections/ComplianceEthicsSection";
import AIReadySection from "../../components/Sections/AIReadySection";

import TabsSection, { TabConfig } from "../../components/Sections/TabsSection";
import EntityTable, { EntityItem } from "../../components/Tables/EntityTable";
import EntityPager from "../../components/Tables/EntityPager";
import LoadingSpinner from "../../../common/LoadingSpinner";
import Alert from "../../../common/Alert";

const Container = styled.div`
  width: 100%;
`;

import { ButtonContainer, DownloadButton } from "../../shared.styles";

const roCrateMainProperties: MetadataProperty[] = [
  { key: "id_value", name: "ARK Identifier" },
  { key: "doi", name: "DOI" },
  { key: "description", name: "Description" },
  { key: "externalUrl", name: "External URL" },
  { key: "notebookUrl", name: "Kaggle Notebook" },
  { key: "release_date", name: "Date Published" },
  { key: "authors", name: "Author(s)" },
  { key: "publisher", name: "Publisher" },
  { key: "principal_investigator", name: "Principal Investigator" },
  { key: "contact_email", name: "Contact Email" },
  { key: "license_value", name: "License" },
  { key: "copyright", name: "Copyright" },
  { key: "content_size", name: "Content Size" },
  { key: "keywords", name: "Keywords" },
  { key: "citation", name: "Citation" },
  { key: "funding", name: "Funding" },
  { key: "related_publications", name: "Related Publications" },
];

/** Page size for server-side category paging. Server default and cap: 50 / 200. */
const PAGE_SIZE = 50;

/** Categories the server's contentSummary reports, in display order. */
const PAGED_CATEGORIES: Array<{
  id: keyof Omit<ContentCounts, "total">;
  label: string;
  headers: string[];
}> = [
  {
    id: "datasets",
    label: "Datasets",
    headers: ["Name", "Description", "Access", "Release Date"],
  },
  {
    id: "software",
    label: "Software",
    headers: ["Name", "Description", "Access", "Release Date"],
  },
  {
    id: "computations",
    label: "Computations",
    headers: ["Name", "Description", "Access", "Date Created"],
  },
  {
    id: "schemas",
    label: "Schemas",
    headers: ["Name", "Description", "Access", "Date Created"],
  },
  {
    id: "samples",
    label: "Samples",
    headers: ["Name", "Description", "Access", "Date Created"],
  },
  {
    id: "mlModels",
    label: "ML Models",
    headers: ["Name", "Description", "Access", "Date Created"],
  },
  {
    id: "rocrates",
    label: "Nested RO-Crates",
    headers: ["Name", "Description", "Access", "Date Created"],
  },
  {
    id: "other",
    label: "Other",
    headers: ["Name", "Description", "Access", "Type"],
  },
];

/**
 * Map one @graph entity onto the row shape EntityTable renders. Shared by the
 * inline path (categorizing a fully expanded graph) and the paged path
 * (entities arriving one page at a time from /rocrate/entities).
 */
function toEntityItem(
  entity: RawGraphEntity,
  apiUrl: string | undefined,
): EntityItem {
  const types = Array.isArray(entity["@type"])
    ? entity["@type"]
    : typeof entity["@type"] === "string"
      ? [entity["@type"]]
      : [];
  const name =
    entity.name ||
    entity["@id"]?.split("/").pop() ||
    entity["@id"] ||
    "Unnamed Entity";
  const description = entity.description || "";
  const date =
    entity.datePublished || entity.dateCreated || entity.dateModified || "";
  const id = entity["@id"] || `genid-${Math.random().toString(16).slice(2)}`;

  let contentStatus = "Metadata Only";
  let contentUrl = "";
  const hasDistribution = entity.distribution !== undefined;

  if (entity.contentUrl === "Embargoed") {
    contentStatus = "Embargoed";
  } else if (entity.contentUrl) {
    contentStatus = "External";
    contentUrl = entity.contentUrl;
  } else if (hasDistribution && entity["@id"] && apiUrl) {
    contentStatus = "Download";
    contentUrl = `${apiUrl}/download/${entity["@id"]}`;
  }

  return {
    name,
    description,
    contentStatus,
    contentUrl,
    date,
    id,
    type: (types[0] as string) || "Unknown",
  };
}

interface CategoryPage {
  items: EntityItem[];
  total: number;
  loading: boolean;
  error?: string;
}

interface ROCrateComponentProps {
  metadata: Metadata;
  arkId?: string;
  /**
   * Present when the crate was loaded with expand=false: entity lists are not
   * in `metadata` and must be paged in from the server instead.
   */
  counts?: ContentCounts;
  paged?: boolean;
}

const ROCrateComponent: React.FC<ROCrateComponentProps> = ({
  metadata,
  arkId,
  counts,
  paged = false,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [aiReadyData, setAiReadyData] = useState<AIReadyData | null>(null);
  const [complianceData, setComplianceData] =
    useState<ComplianceEthicsData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "info">("error");

  const apiUrl = window.API_URL;

  const [datasets, setDatasets] = useState<EntityItem[]>([]);
  const [software, setSoftware] = useState<EntityItem[]>([]);
  const [computations, setComputations] = useState<EntityItem[]>([]);
  const [samples, setSamples] = useState<EntityItem[]>([]);
  const [experiments, setExperiments] = useState<EntityItem[]>([]);
  const [instruments, setInstruments] = useState<EntityItem[]>([]);
  const [otherItems, setOtherItems] = useState<EntityItem[]>([]);

  // Paged mode: one page of rows per category, plus the page index per tab.
  const metadataApi = useMetadataApi();
  const [pageIndex, setPageIndex] = useState<Record<string, number>>({});
  const [pagedEntities, setPagedEntities] = useState<
    Record<string, CategoryPage>
  >({});

  const pagedTabs = useMemo<TabConfig[]>(() => {
    if (!paged || !counts) return [];
    return PAGED_CATEGORIES.filter((c) => (counts[c.id] ?? 0) > 0).map((c) => ({
      id: c.id,
      label: c.label,
      count: counts[c.id] ?? 0,
    }));
  }, [paged, counts]);

  // Pick the first non-empty category once counts arrive.
  useEffect(() => {
    if (!paged) return;
    if (pagedTabs.length === 0) {
      setActiveTab("");
      return;
    }
    if (!pagedTabs.some((t) => t.id === activeTab)) {
      setActiveTab(pagedTabs[0].id);
    }
  }, [paged, pagedTabs, activeTab]);

  // Fetch the active category's current page. Cached per category+page, so
  // revisiting a tab does not refetch. The requested-key set lives in a ref
  // rather than the dep array: depending on `pagedEntities` here would let the
  // effect's own setState re-run it and cancel the in-flight request.
  const requestedPages = useRef<Set<string>>(new Set());
  const activePage = pageIndex[activeTab] ?? 0;

  useEffect(() => {
    if (!paged || !arkId || !activeTab) return;
    const cacheKey = `${activeTab}:${activePage}`;
    if (requestedPages.current.has(cacheKey)) return;
    requestedPages.current.add(cacheKey);

    let cancelled = false;
    setPagedEntities((prev) => ({
      ...prev,
      [cacheKey]: { items: [], total: 0, loading: true },
    }));

    metadataApi
      .getRoCrateEntities(arkId, activeTab, {
        limit: PAGE_SIZE,
        offset: activePage * PAGE_SIZE,
      })
      .then((res: any) => {
        if (cancelled) return;
        const items = ((res?.items ?? []) as RawGraphEntity[]).map((e) =>
          toEntityItem(e, apiUrl),
        );
        setPagedEntities((prev) => ({
          ...prev,
          [cacheKey]: {
            items,
            total: res?.total ?? items.length,
            loading: false,
          },
        }));
      })
      .catch((err: any) => {
        if (cancelled) return;
        setPagedEntities((prev) => ({
          ...prev,
          [cacheKey]: {
            items: [],
            total: 0,
            loading: false,
            error: err?.message || "Failed to load entities.",
          },
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [paged, arkId, activeTab, activePage, apiUrl]);

  const getToken = () => localStorage.getItem("token") || "";
  const sanitizeFilename = (name: string): string =>
    name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");

  const handleDownload = async (downloadUrl: string) => {
    const token = getToken();

    if (
      !token &&
      !overviewData?.contentUrl &&
      downloadUrl.startsWith(apiUrl || "")
    ) {
      setAlertMessage("You must be logged in to download files via API.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    setShowAlert(false);
    const tempLoadingAnchor = document.querySelector(
      `[data-testid="rocrate-download-button"]`,
    ) as HTMLAnchorElement;
    let originalButtonText = "Download RO-Crate";
    if (tempLoadingAnchor) {
      originalButtonText = tempLoadingAnchor.textContent || "Download RO-Crate";
      tempLoadingAnchor.textContent = "Downloading...";
      tempLoadingAnchor.style.pointerEvents = "none";
      tempLoadingAnchor.style.opacity = "0.7";
    }

    try {
      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "blob",
        headers:
          token && downloadUrl.startsWith(apiUrl || "")
            ? { Authorization: `Bearer ${token}` }
            : {},
      });

      let filename = "rocrate-download.zip";
      const crateNameForFile = overviewData?.title;

      if (crateNameForFile) {
        const sanitizedName = sanitizeFilename(crateNameForFile);
        filename = `${sanitizedName}.zip`;
      } else {
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            const extractedName = matches[1].replace(/['"]/g, "");
            filename = extractedName.toLowerCase().endsWith(".zip")
              ? extractedName
              : `${extractedName}.zip`;
          }
        }
      }

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], {
          type: response.headers["content-type"] || "application/zip",
        }),
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error("Download failed:", error);
      let message = `Download failed. Please try again.`;
      if (error.response) {
        if (
          error.response.data instanceof Blob &&
          error.response.data.type === "application/json"
        ) {
          try {
            const errJson = JSON.parse(await error.response.data.text());
            message = `Download failed: ${
              errJson.error || errJson.message || error.response.statusText
            }`;
          } catch (parseError) {
            message = `Download failed with status: ${error.response.status} ${error.response.statusText}`;
          }
        } else if (error.response.status === 401) {
          message =
            "Download failed: You might not have permission to access this RO-Crate. Please ensure you are logged in and part of the required group.";
        } else {
          message = `Download failed with status: ${error.response.status} ${error.response.statusText}`;
        }
      } else if (error.request) {
        message = "Download failed: No response received from the server.";
      } else {
        message = `Download failed: ${error.message}`;
      }
      setAlertMessage(message);
      setAlertType("error");
      setShowAlert(true);
    } finally {
      if (tempLoadingAnchor) {
        tempLoadingAnchor.textContent = originalButtonText;
        tempLoadingAnchor.style.pointerEvents = "auto";
        tempLoadingAnchor.style.opacity = "1";
      }
    }
  };

  useEffect(() => {
    const processAndCategorize = () => {
      try {
        if (!metadata || !metadata["@graph"]) {
          setError("Invalid or missing RO-Crate metadata.");
          setLoading(false);
          return;
        }

        const overview = processOverview(metadata);
        setOverviewData(overview);
        setAiReadyData(processAIReady(metadata));
        setComplianceData(processComplianceEthics(metadata));
        console.log("Overview Data:", overview);
        categorizeEntities(metadata["@graph"] as RawGraphEntity[]);
      } catch (err: any) {
        console.error("Error processing RO-Crate data:", err);
        setError(`Failed to process RO-Crate data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setError(null);
    processAndCategorize();
  }, [metadata, arkId]);

  const categorizeEntities = (graph: RawGraphEntity[]) => {
    if (!graph || !Array.isArray(graph)) return;

    const metadataEntity = graph.find(
      (e) => e["@id"] === null || e["@id"] === "ro-crate-metadata.json",
    );

    const rootId = metadataEntity?.about?.["@id"] || "./";
    const rootEntity = graph.find((entity) => entity["@id"] === rootId);

    if (!rootEntity && rootId !== "./") {
      console.warn(
        `Could not find specified root entity with ID: ${rootId}. Root features might be unavailable.`,
      );
    }

    const entities = graph.filter(
      (entity) =>
        entity["@id"] !== null &&
        entity["@id"] !== "ro-crate-metadata.json" &&
        entity["@id"] !== rootId,
    );

    const processedDatasets: EntityItem[] = [];
    const processedSoftware: EntityItem[] = [];
    const processedComputations: EntityItem[] = [];
    const processedSamples: EntityItem[] = [];
    const processedExperiments: EntityItem[] = [];
    const processedInstruments: EntityItem[] = [];
    const processedOther: EntityItem[] = [];

    entities.forEach((entity) => {
      const types = Array.isArray(entity["@type"])
        ? entity["@type"]
        : typeof entity["@type"] === "string"
          ? [entity["@type"]]
          : [];
      const item: EntityItem = toEntityItem(entity, apiUrl);

      if (
        types.includes("https://w3id.org/EVI#Dataset") ||
        types.includes("Dataset") ||
        types.includes("EVI:Dataset") ||
        types.includes("evi:dataset")
      ) {
        processedDatasets.push(item);
      } else if (
        types.includes("https://w3id.org/EVI#Software") ||
        types.includes("evi:software") ||
        types.includes("Software") ||
        types.includes("EVI:Software") ||
        types.includes("SoftwareApplication") ||
        types.includes("SoftwareSourceCode")
      ) {
        processedSoftware.push(item);
      } else if (
        types.includes("https://w3id.org/EVI#Computation") ||
        types.includes("Computation") ||
        types.includes("EVI:Computation") ||
        types.includes("ComputationalWorkflow")
      ) {
        processedComputations.push(item);
      } else if (types.includes("https://w3id.org/EVI#Sample")) {
        processedSamples.push(item);
      } else if (types.includes("https://w3id.org/EVI#Experiment")) {
        processedExperiments.push(item);
      } else if (types.includes("https://w3id.org/EVI#Instrument")) {
        processedInstruments.push(item);
      } else {
        processedOther.push(item);
      }
    });

    setDatasets(processedDatasets);
    setSoftware(processedSoftware);
    setComputations(processedComputations);
    setSamples(processedSamples);
    setExperiments(processedExperiments);
    setInstruments(processedInstruments);
    setOtherItems(processedOther);

    // In paged mode the graph holds only the crate shell, so the tab set comes
    // from the summary counts instead — leave activeTab to that effect.
    if (paged) return;

    const firstAvailableTabId =
      (processedDatasets.length > 0 && "datasets") ||
      (processedSoftware.length > 0 && "software") ||
      (processedComputations.length > 0 && "computations") ||
      (processedSamples.length > 0 && "samples") ||
      (processedExperiments.length > 0 && "experiments") ||
      (processedInstruments.length > 0 && "instruments") ||
      (processedOther.length > 0 && "other") ||
      "";

    if (firstAvailableTabId && !activeTab) {
      setTimeout(() => setActiveTab(firstAvailableTabId), 0);
    } else if (!firstAvailableTabId && activeTab) {
      setTimeout(() => setActiveTab(""), 0);
    }
  };

  const generateTabs = (): TabConfig[] => {
    if (paged) return pagedTabs;
    const tabs: TabConfig[] = [];
    if (datasets.length > 0)
      tabs.push({ id: "datasets", label: "Datasets", count: datasets.length });
    if (software.length > 0)
      tabs.push({ id: "software", label: "Software", count: software.length });
    if (computations.length > 0)
      tabs.push({
        id: "computations",
        label: "Computations",
        count: computations.length,
      });
    if (samples.length > 0)
      tabs.push({ id: "samples", label: "Samples", count: samples.length });
    if (experiments.length > 0)
      tabs.push({
        id: "experiments",
        label: "Experiments",
        count: experiments.length,
      });
    if (instruments.length > 0)
      tabs.push({
        id: "instruments",
        label: "Instruments",
        count: instruments.length,
      });
    if (otherItems.length > 0)
      tabs.push({ id: "other", label: "Other", count: otherItems.length });
    return tabs;
  };

  if (loading && !overviewData) return <LoadingSpinner />;
  if (error)
    return (
      <Alert
        type="error"
        title="Error Loading Data"
        message={error}
        onClose={() => setError(null)}
      />
    );
  if (!metadata && !loading)
    return (
      <Alert
        type="info"
        title="No Data"
        message="Could not load or process RO-Crate data."
      />
    );

  const tabs = generateTabs();

  return (
    <Container>
      {overviewData && (
        <ConfigurableMetadataTable
          title="RO-Crate Details"
          data={overviewData}
          properties={roCrateMainProperties}
        />
      )}

      {complianceData && <ComplianceEthicsSection data={complianceData} />}

      {aiReadyData && <AIReadySection data={aiReadyData} />}

      {overviewData && overviewData.additionalCustomProperties && (
        <AdditionalPropertiesSection
          properties={overviewData.additionalCustomProperties}
        />
      )}

      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          title={alertType === "error" ? "Download Error" : "Information"}
        />
      )}

      {tabs.length > 0 && paged && (
        <>
          <TabsSection
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {(() => {
            const category = PAGED_CATEGORIES.find((c) => c.id === activeTab);
            if (!category) return null;
            const state = pagedEntities[`${activeTab}:${activePage}`];
            const total = counts?.[category.id] ?? state?.total ?? 0;

            if (state?.error) {
              return <Alert type="error" message={state.error} />;
            }
            if (!state || state.loading) {
              return <LoadingSpinner />;
            }
            return (
              <>
                <EntityTable items={state.items} headers={category.headers} />
                <EntityPager
                  page={activePage}
                  pageSize={PAGE_SIZE}
                  total={total}
                  disabled={state.loading}
                  onPageChange={(next) =>
                    setPageIndex((prev) => ({ ...prev, [activeTab]: next }))
                  }
                />
              </>
            );
          })()}
        </>
      )}

      {tabs.length > 0 && !paged && (
        <>
          <TabsSection
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {activeTab === "datasets" && datasets.length > 0 && (
            <EntityTable
              items={datasets}
              headers={["Name", "Description", "Access", "Release Date"]}
            />
          )}
          {activeTab === "software" && software.length > 0 && (
            <EntityTable
              items={software}
              headers={["Name", "Description", "Access", "Release Date"]}
            />
          )}
          {activeTab === "computations" && computations.length > 0 && (
            <EntityTable
              items={computations}
              headers={["Name", "Description", "Access", "Date Created"]}
            />
          )}
          {activeTab === "samples" && samples.length > 0 && (
            <EntityTable
              items={samples}
              headers={["Name", "Description", "Identifier", "Date Created"]}
            />
          )}
          {activeTab === "experiments" && experiments.length > 0 && (
            <EntityTable
              items={experiments}
              headers={["Name", "Description", "Type", "Date Created"]}
            />
          )}
          {activeTab === "instruments" && instruments.length > 0 && (
            <EntityTable
              items={instruments}
              headers={["Name", "Description", "Manufacturer", "Date Created"]}
            />
          )}
          {activeTab === "other" && otherItems.length > 0 && (
            <EntityTable
              items={otherItems}
              headers={["Name", "Description", "@id", "Type"]}
            />
          )}
        </>
      )}
      {tabs.length === 0 && !loading && overviewData && (
        <Alert
          type="info"
          message="This RO-Crate contains metadata but no categorized data entities (Datasets, Software, etc.) were found in the graph."
        />
      )}
    </Container>
  );
};

export default ROCrateComponent;
