import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Metadata, RawGraphEntity } from "../../types";
import { processOverview, OverviewData } from "../../utils/metadataProcessing";
import OverviewSection from "./OverviewSection";
import TabsSection, { TabConfig } from "./TabsSection";
import EntityTable, { EntityItem } from "./EntityTable";
import LoadingSpinner from "../common/LoadingSpinner";
import Alert from "../common/Alert";

const Container = styled.div`
  width: 100%;
`;

const DownloadButton = styled.a`
  display: inline-block;
  margin: ${({ theme }) => theme.spacing.md} 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface ROCrateComponentProps {
  metadata: Metadata;
  arkId?: string;
}

const ROCrateComponent: React.FC<ROCrateComponentProps> = ({
  metadata,
  arkId,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "info">("error");

  const apiUrl =
    import.meta.env.VITE_FAIRSCAPE_API_URL || "https://fairscape.net/api";

  const [datasets, setDatasets] = useState<EntityItem[]>([]);
  const [software, setSoftware] = useState<EntityItem[]>([]);
  const [computations, setComputations] = useState<EntityItem[]>([]);
  const [samples, setSamples] = useState<EntityItem[]>([]);
  const [experiments, setExperiments] = useState<EntityItem[]>([]);
  const [instruments, setInstruments] = useState<EntityItem[]>([]);
  const [otherItems, setOtherItems] = useState<EntityItem[]>([]);

  const getToken = () => {
    return localStorage.getItem("token") || "";
  };

  const sanitizeFilename = (name: string): string => {
    return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
  };

  const handleDownload = async (downloadUrl: string) => {
    const token = getToken();

    if (!token) {
      setAlertMessage("You must be logged in to download files.");
      setAlertType("error");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    setShowAlert(false);

    try {
      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let filename = "rocrate-download.zip";

      if (overviewData?.name) {
        const sanitizedName = sanitizeFilename(overviewData.name);
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
        })
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
      setLoading(false);
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
        console.log("Overview data:", overview);
        setOverviewData(overview);
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
  }, [metadata, arkId, apiUrl]);

  const categorizeEntities = (graph: RawGraphEntity[]) => {
    if (!graph || !Array.isArray(graph)) return;

    const metadataEntity = graph.find(
      (e) => e["@id"] === null || e["@id"] === "ro-crate-metadata.json"
    );

    if (!metadataEntity) {
      console.error("Could not find metadata entity in RO-Crate");
    }

    const rootId = metadataEntity?.about?.["@id"] || "./";

    const rootEntity = graph.find((entity) => entity["@id"] === rootId);

    if (!rootEntity && rootId !== "./") {
      console.warn(
        `Could not find specified root entity with ID: ${rootId}. Root features might be unavailable.`
      );
    } else if (rootEntity) {
      console.log("Found root entity:", rootEntity);
    }

    const entities = graph.filter(
      (entity) =>
        entity["@id"] !== null &&
        entity["@id"] !== "ro-crate-metadata.json" &&
        entity["@id"] !== rootId
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
      const name =
        entity.name ||
        entity["@id"]?.split("/").pop() ||
        entity["@id"] ||
        "Unnamed Entity";
      const description = entity.description || "";
      const date =
        entity.datePublished || entity.dateCreated || entity.dateModified || "";
      const id =
        entity["@id"] || `genid-${Math.random().toString(16).slice(2)}`;

      let contentStatus = "Metadata Only"; // Default value
      let contentUrl = "";
      const hasDistribution = entity.distribution !== undefined;

      if (entity.contentUrl === "Embargoed") {
        contentStatus = "Embargoed";
      } else if (entity.contentUrl) {
        // If contentUrl exists and is not Embargoed, mark as Download
        contentStatus = "Download";
        contentUrl = entity.contentUrl; // Use the direct contentUrl
      } else if (hasDistribution && entity["@id"]) {
        // If no contentUrl but distribution exists, mark as Download via API
        contentStatus = "Download";
        contentUrl = `${apiUrl}/download/${entity["@id"]}`; // Construct API download URL
      } else {
        // If no contentUrl and no distribution, it's likely metadata only
        contentStatus = "Metadata Only";
      }

      const item: EntityItem = {
        name,
        description,
        contentStatus,
        contentUrl,
        date,
        id,
      };

      if (
        types.includes("https://w3id.org/EVI#Dataset") ||
        types.includes("Dataset")
      ) {
        processedDatasets.push(item);
      } else if (
        types.includes("https://w3id.org/EVI#Software") ||
        types.includes("SoftwareApplication") ||
        types.includes("SoftwareSourceCode")
      ) {
        processedSoftware.push(item);
      } else if (
        types.includes("https://w3id.org/EVI#Computation") ||
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
        item.type = types[0] || "Unknown";
        processedOther.push(item);
      }
    });

    console.log("Processed datasets (Download logic):", processedDatasets);
    console.log("Processed software (Download logic):", processedSoftware);
    console.log(
      "Processed computations (Download logic):",
      processedComputations
    );

    setDatasets(processedDatasets);
    setSoftware(processedSoftware);
    setComputations(processedComputations);
    setSamples(processedSamples);
    setExperiments(processedExperiments);
    setInstruments(processedInstruments);
    setOtherItems(processedOther);

    const firstAvailableTabId =
      (processedDatasets.length > 0 && "datasets") ||
      (processedSoftware.length > 0 && "software") ||
      (processedComputations.length > 0 && "computations") ||
      (processedSamples.length > 0 && "samples") ||
      (processedExperiments.length > 0 && "experiments") ||
      (processedInstruments.length > 0 && "instruments") ||
      (otherItems.length > 0 && "other") ||
      "";

    if (firstAvailableTabId && !activeTab) {
      setTimeout(() => setActiveTab(firstAvailableTabId), 0);
    } else if (!firstAvailableTabId && activeTab) {
      setTimeout(() => setActiveTab(""), 0);
    }
  };

  const generateTabs = (): TabConfig[] => {
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
  const downloadUrl = arkId ? `${apiUrl}/rocrate/download/${arkId}` : "";

  return (
    <Container>
      {loading && overviewData && <LoadingSpinner overlay={true} />}

      {overviewData && <OverviewSection overviewData={overviewData} />}

      {arkId && downloadUrl && (
        <ButtonContainer>
          <DownloadButton
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (!loading) {
                handleDownload(downloadUrl);
              }
            }}
            data-testid="rocrate-download-button"
            aria-disabled={loading}
            style={loading ? { pointerEvents: "none", opacity: 0.7 } : {}}
          >
            {loading ? "Downloading..." : "Download Complete RO-Crate"}
          </DownloadButton>
        </ButtonContainer>
      )}

      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          title={alertType === "error" ? "Download Error" : "Information"}
        />
      )}

      {tabs.length > 0 && (
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
