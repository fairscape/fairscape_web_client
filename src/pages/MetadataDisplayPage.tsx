// src/pages/MetadataDisplayPage.tsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import styled from "styled-components";

import EvidenceGraphViewer from "../components/EvidenceGraph/EvidenceGraphViewer";
import ButtonGroup from "../components/MetadataDisplay/ButtonGroup";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import ReleaseComponent from "../components/MetadataDisplay/ReleaseComponent";
import ROCrateComponent from "../components/MetadataDisplay/ROCrateComponent";
import GenericMetadataComponent from "../components/MetadataDisplay/GenericMetadataComponent";
import SerializationView from "../components/MetadataDisplay/SerializationView";

import { AuthContext } from "../context/AuthContext";
import metadataService from "../hooks/metadataService";
import { findRootEntity } from "../utils/metadataProcessing";

import {
  RawGraphData,
  Metadata,
  SupportingElement,
  SupportData,
  RawGraphEntity,
} from "../types";

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;
Container.displayName = "Container";

const Header = styled.header`
  margin-bottom: 20px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: 15px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 20px;
  border-radius: 5px;
`;
Header.displayName = "Header";

const PageTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.primary};
`;
PageTitle.displayName = "PageTitle";

const VersionInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;
VersionInfo.displayName = "VersionInfo";

const ButtonGroupContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;
ButtonGroupContainer.displayName = "ButtonGroupContainer";

const Footer = styled.footer`
  margin-top: 30px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 5px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;
Footer.displayName = "Footer";

type ViewType = "metadata" | "serialization" | "graph";

interface TraverseParams {
  node: RawGraphEntity;
  results: SupportData;
  seenIds: Set<string>;
}

const traverseAndCollect = ({
  node,
  results,
  seenIds,
}: TraverseParams): void => {
  if (
    !node ||
    typeof node !== "object" ||
    !node["@id"] ||
    seenIds.has(node["@id"])
  ) {
    return;
  }
  seenIds.add(node["@id"]);
  let nodeTypes: string[] =
    typeof node["@type"] === "string"
      ? [node["@type"]]
      : Array.isArray(node["@type"])
      ? node["@type"]
      : ["Unknown"];
  const outputElement: SupportingElement = {
    "@id": node["@id"],
    name: node.name || "N/A",
    description: node.description || "",
    "@type": node["@type"] || "Unknown",
  };

  if (
    nodeTypes.some((t) => t.includes("Dataset")) &&
    !results.datasets.some((el) => el["@id"] === node["@id"])
  )
    results.datasets.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Software")) &&
    !results.software.some((el) => el["@id"] === node["@id"])
  )
    results.software.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Computation")) &&
    !results.computations.some((el) => el["@id"] === node["@id"])
  )
    results.computations.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Sample")) &&
    !results.samples.some((el) => el["@id"] === node["@id"])
  )
    results.samples.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Experiment")) &&
    !results.experiments.some((el) => el["@id"] === node["@id"])
  )
    results.experiments.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Instrument")) &&
    !results.instruments.some((el) => el["@id"] === node["@id"])
  )
    results.instruments.push(outputElement);

  const relationshipKeys = [
    "generatedBy",
    "usedDataset",
    "usedSoftware",
    "usedSample",
    "usedInstrument",
    "hasPart",
  ];
  for (const key of relationshipKeys) {
    const relatedItems = node[key];
    if (!relatedItems) continue;
    const itemsToProcess: any[] = Array.isArray(relatedItems)
      ? relatedItems
      : [relatedItems];
    for (const item of itemsToProcess) {
      if (item && typeof item === "object" && item["@id"]) {
        traverseAndCollect({ node: item as RawGraphEntity, results, seenIds });
      }
    }
  }
};

const extractSupportData = (
  graphData: RawGraphData | null
): SupportData | null => {
  console.log(
    "[MetadataDisplayPage - extractSupportData] Called. graphData:",
    graphData ? "present" : "null"
  );
  if (!graphData || !graphData["@graph"]) {
    console.warn(
      "[MetadataDisplayPage - extractSupportData] Invalid graphData or missing @graph.",
      { graphData }
    );
    return null;
  }
  const results: SupportData = {
    datasets: [],
    software: [],
    computations: [],
    samples: [],
    experiments: [],
    instruments: [],
  };
  const seenIds = new Set<string>();
  const graphEntities = graphData["@graph"];

  if (Array.isArray(graphEntities)) {
    const rootEntity = findRootEntity(graphEntities);
    if (rootEntity) {
      traverseAndCollect({ node: rootEntity, results, seenIds });
    } else {
      graphEntities.forEach((entity) =>
        traverseAndCollect({ node: entity, results, seenIds })
      );
    }
  } else if (typeof graphEntities === "object" && graphEntities !== null) {
    traverseAndCollect({
      node: graphEntities as RawGraphEntity,
      results,
      seenIds,
    });
  } else {
    console.warn(
      "[MetadataDisplayPage - extractSupportData] @graph is not processable.",
      { graphEntities }
    );
    return null;
  }
  const hasData = Object.values(results).some((arr) => arr.length > 0);
  console.log(
    "[MetadataDisplayPage - extractSupportData] Extraction complete. Has data:",
    hasData
  );
  return hasData ? results : null;
};

const CenteredMessageWithSpinner: React.FC<{ message: string }> = ({
  message,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}
  >
    <LoadingSpinner />
    <p style={{ marginTop: "10px", color: "#666", textAlign: "center" }}>
      {message}
    </p>
  </div>
);

const MetadataDisplayPage: React.FC = () => {
  const location = window.location.pathname;
  const arkId = location.includes("/view/") ? location.split("/view/")[1] : "";

  const [view, setView] = useState<ViewType>("metadata");
  const [title, setTitle] = useState<string>("Data Display");
  const [version, setVersion] = useState<string>("1.0");

  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // For initial metadata
  const [error, setError] = useState<string | null>(null);
  const [determinedType, setDeterminedType] = useState<string | null>(null);

  const [evidenceGraphData, setEvidenceGraphData] =
    useState<RawGraphData | null>(null);
  const [supportData, setSupportData] = useState<SupportData | null>(null);
  const [hasEvidenceGraphLink, setHasEvidenceGraphLink] =
    useState<boolean>(false);
  const [currentEvidenceGraphId, setCurrentEvidenceGraphId] = useState<
    string | null
  >(null);
  const [evidenceGraphLoading, setEvidenceGraphLoading] =
    useState<boolean>(false);
  const [evidenceGraphError, setEvidenceGraphError] = useState<string | null>(
    null
  );
  const [needsBuildAttempt, setNeedsBuildAttempt] = useState<boolean>(false);

  const { isLoggedIn } = useContext(AuthContext);
  const metadataServiceInstance = useMemo(() => metadataService(), []);

  // Effect 1: Fetch initial metadata
  useEffect(() => {
    const fetchInitial = async () => {
      if (!arkId) {
        setLoading(false);
        setError("No ARK ID provided");
        return;
      }
      console.log(
        `[MetadataDisplayPage - Effect1] Fetching initial metadata for ARK: ${arkId}`
      );
      setLoading(true);
      setError(null);
      setMetadata(null);
      setDeterminedType(null);
      setHasEvidenceGraphLink(false);
      setCurrentEvidenceGraphId(null);
      setEvidenceGraphData(null);
      setSupportData(null);
      setEvidenceGraphLoading(false);
      setEvidenceGraphError(null);
      setNeedsBuildAttempt(false);

      try {
        const result = await metadataServiceInstance.fetchInitialMetadata(
          arkId
        );
        console.log(
          "[MetadataDisplayPage - Effect1] Initial metadata result:",
          result
        );
        if (result.error) throw new Error(result.error);

        setMetadata(result.metadata);
        setDeterminedType(result.type);
        setHasEvidenceGraphLink(result.hasEvidenceGraph);
        setCurrentEvidenceGraphId(result.evidenceGraphId);

        if (result.metadata) {
          const graph = result.metadata["@graph"];
          let rootName = "Details",
            rootVersion = "1.0";
          if (graph && Array.isArray(graph)) {
            const root = findRootEntity(graph);
            if (root) {
              rootName = root.name || rootName;
              rootVersion = root.version || rootVersion;
            }
          } else if (
            graph &&
            typeof graph === "object" &&
            !Array.isArray(graph)
          ) {
            rootName = (graph as any).name || rootName;
            rootVersion = (graph as any).version || rootVersion;
          } else if (result.metadata.name) {
            rootName = result.metadata.name;
            rootVersion = result.metadata.version || rootVersion;
          }
          setTitle(
            rootName === "Details"
              ? `${
                  result.type.charAt(0).toUpperCase() + result.type.slice(1)
                } Details`
              : rootName
          );
          setVersion(rootVersion);
        }
        // Determine if a build attempt is needed
        if (
          !result.hasEvidenceGraph &&
          result.type &&
          !["release", "rocrate"].includes(result.type) &&
          isLoggedIn
        ) {
          console.log(
            `[MetadataDisplayPage - Effect1] No evidence graph link for ${result.type}, user logged in. Flagging for build attempt.`
          );
          setNeedsBuildAttempt(true);
        }
        setLoading(false); // Initial metadata loaded
      } catch (err: any) {
        setLoading(false);
        setError(err.message || "Failed to fetch initial data");
        console.error("[MetadataDisplayPage - Effect1] Error:", err);
      }
    };
    fetchInitial();
  }, [arkId, isLoggedIn, metadataServiceInstance]);

  // Effect 2: Manage Evidence Graph (fetch or build then fetch)
  useEffect(() => {
    const manageGraph = async () => {
      if (loading) return; // Wait for initial metadata load to complete

      if (hasEvidenceGraphLink && currentEvidenceGraphId) {
        console.log(
          `[MetadataDisplayPage - Effect2] Has link, fetching graph ID: ${currentEvidenceGraphId}`
        );
        setEvidenceGraphLoading(true);
        setEvidenceGraphError(null);
        try {
          const graphData =
            await metadataServiceInstance.fetchEvidenceGraphDataById(
              currentEvidenceGraphId
            );
          if (graphData) {
            setEvidenceGraphData(graphData);
            setSupportData(extractSupportData(graphData));
            console.log(
              "[MetadataDisplayPage - Effect2] Successfully fetched and processed existing evidence graph."
            );
          } else {
            throw new Error("Evidence graph data not found or fetch failed.");
          }
        } catch (err: any) {
          setEvidenceGraphError(
            err.message || "Failed to load evidence graph."
          );
          console.error(
            "[MetadataDisplayPage - Effect2] Error fetching existing graph:",
            err
          );
        } finally {
          setEvidenceGraphLoading(false);
        }
      } else if (needsBuildAttempt && arkId && isLoggedIn) {
        console.log(
          `[MetadataDisplayPage - Effect2] Needs build attempt for ARK: ${arkId}`
        );
        setEvidenceGraphLoading(true); // Indicate "building/checking"
        setEvidenceGraphError(null);
        try {
          const buildResult =
            await metadataServiceInstance.triggerEvidenceGraphBuild(arkId);
          console.log(
            "[MetadataDisplayPage - Effect2] Build trigger result:",
            buildResult
          );
          setNeedsBuildAttempt(false); // Attempt made

          if (buildResult.error && !buildResult.hasEvidenceGraph) {
            // If error and still no graph, show error
            throw new Error(buildResult.error);
          }

          if (buildResult.updatedMetadata) {
            // Update main metadata if it changed
            setMetadata(buildResult.updatedMetadata);
          }

          setHasEvidenceGraphLink(buildResult.hasEvidenceGraph);
          setCurrentEvidenceGraphId(buildResult.evidenceGraphId);
          // If buildResult.hasEvidenceGraph is true, the first part of this effect will pick it up in the next render cycle.
          if (!buildResult.hasEvidenceGraph) {
            console.log(
              "[MetadataDisplayPage - Effect2] Build attempt did not result in an available graph link."
            );
            setEvidenceGraphLoading(false); // Stop loading if still no graph
          }
        } catch (err: any) {
          setEvidenceGraphError(
            err.message ||
              "Failed to build or retrieve evidence graph after build attempt."
          );
          console.error(
            "[MetadataDisplayPage - Effect2] Error during build attempt:",
            err
          );
          setEvidenceGraphLoading(false);
        }
      }
    };

    manageGraph();
  }, [
    loading,
    hasEvidenceGraphLink,
    currentEvidenceGraphId,
    needsBuildAttempt,
    arkId,
    isLoggedIn,
    metadataServiceInstance,
  ]);

  useEffect(() => {
    document.title = `${title} - FAIRSCAPE`;
  }, [title]);

  const renderContent = () => {
    if (loading)
      return <CenteredMessageWithSpinner message="Loading metadata..." />;
    if (error)
      return <Alert type="error" title="Error Loading Data" message={error} />;

    if (view !== "graph" && !metadata) {
      return (
        <Alert
          type="info"
          title="No Metadata Available"
          message="Metadata details could not be loaded."
        />
      );
    }

    switch (view) {
      case "metadata":
        if (!metadata)
          return (
            <CenteredMessageWithSpinner message="Loading metadata details..." />
          );
        const metaType = determinedType || "unknown";
        switch (metaType) {
          case "release":
            return <ReleaseComponent metadata={metadata} arkId={arkId} />;
          case "rocrate":
            return <ROCrateComponent metadata={metadata} arkId={arkId} />;
          case "dataset":
            return (
              <GenericMetadataComponent
                metadata={metadata}
                type="dataset"
                arkId={arkId}
              />
            );
          case "software":
            return (
              <GenericMetadataComponent
                metadata={metadata}
                type="software"
                arkId={arkId}
              />
            );
          case "computation":
            return (
              <GenericMetadataComponent
                metadata={metadata}
                type="computation"
                arkId={arkId}
              />
            );
          case "schema":
          case "evi:schema":
            return (
              <GenericMetadataComponent
                metadata={metadata}
                type="schema"
                arkId={arkId}
              />
            );
          default:
            return (
              <Alert
                type="warning"
                title="Unknown Type"
                message={`Display not configured for type: ${metaType}`}
              />
            );
        }

      case "serialization":
        if (!metadata)
          return (
            <CenteredMessageWithSpinner message="Loading serialization data..." />
          );
        return (
          <SerializationView
            json={JSON.stringify(metadata, null, 2)}
            rdfXml={null}
            turtle={null}
            showAllFormats={true}
          />
        );

      case "graph":
        if (evidenceGraphLoading) {
          return (
            <CenteredMessageWithSpinner
              message={
                needsBuildAttempt
                  ? "Attempting to build and load Evidence Graph..."
                  : "Loading Evidence Graph data..."
              }
            />
          );
        }
        if (evidenceGraphError) {
          return (
            <Alert
              type="error"
              title="Evidence Graph Error"
              message={evidenceGraphError}
            />
          );
        }
        if (!hasEvidenceGraphLink && !needsBuildAttempt) {
          // No link and no build attempt means it's definitively not there or build failed silently before
          return (
            <Alert
              type="info"
              title="No Evidence Graph"
              message="No evidence graph is associated with this item, or it could not be made available."
            />
          );
        }
        if (!evidenceGraphData && hasEvidenceGraphLink) {
          // Link exists, but data not loaded yet (should be covered by loading or error)
          return (
            <CenteredMessageWithSpinner message="Preparing Evidence Graph..." />
          );
        }
        if (!evidenceGraphData && !hasEvidenceGraphLink && needsBuildAttempt) {
          // Build was attempted, but no graph resulted yet
          return (
            <CenteredMessageWithSpinner message="Evidence Graph is being prepared or was not found. Please check back or refresh." />
          );
        }
        if (evidenceGraphData) {
          return (
            <EvidenceGraphViewer
              evidenceGraphData={evidenceGraphData}
              supportData={supportData}
            />
          );
        }
        // Fallback if logic misses a case, or if build is pending but not actively "loading"
        return (
          <Alert
            type="info"
            title="Evidence Graph Status"
            message="The evidence graph is either being prepared or is not available for this item."
          />
        );

      default:
        return (
          <Alert
            type="error"
            title="Invalid View"
            message={`Unknown view selected: ${view}`}
          />
        );
    }
  };

  return (
    <Container>
      <Header>
        <PageTitle>{title}</PageTitle>
        <VersionInfo>Version: {version}</VersionInfo>
      </Header>
      <ButtonGroupContainer>
        <ButtonGroup
          currentView={view}
          onSelectView={(selectedView) => setView(selectedView as ViewType)}
          showEvidenceGraphButton={
            hasEvidenceGraphLink || needsBuildAttempt || evidenceGraphLoading
          }
          showExplorerButton={determinedType === "dataset"}
          explorerArkId={arkId}
        />
      </ButtonGroupContainer>
      {renderContent()}
      <Footer>
        Metadata & Provenance: This metadata and provenance were generated by
        the FAIRSCAPE AI-readiness platform (Al Manir, et al. a2024, BioRXiv
        2024.12.23.629818;{" "}
        <a
          href="https://doi.org/10.1101/2024.12.23.629818"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://doi.org/10.1101/2024.12.23.629818
        </a>
        ).
      </Footer>
    </Container>
  );
};

export default MetadataDisplayPage;
