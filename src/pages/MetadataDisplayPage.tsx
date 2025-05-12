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
  node: any;
  results: SupportData;
  seenIds: Set<string>;
}

// Recursive traversal function
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

  // --- Categorize the current node ---
  let nodeTypes: string[] = [];
  if (typeof node["@type"] === "string") nodeTypes = [node["@type"]];
  else if (Array.isArray(node["@type"])) nodeTypes = node["@type"];
  else nodeTypes = ["Unknown"];

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

    const itemsToProcess = Array.isArray(relatedItems)
      ? relatedItems
      : [relatedItems];

    for (const item of itemsToProcess) {
      if (item && typeof item === "object") {
        traverseAndCollect({ node: item, results, seenIds });
      }
    }
  }
};

const extractSupportData = (
  graphData: RawGraphData | null
): SupportData | null => {
  if (
    !graphData ||
    !graphData["@graph"] ||
    typeof graphData["@graph"] !== "object"
  ) {
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

  traverseAndCollect({ node: graphData["@graph"], results, seenIds });

  const hasData = Object.values(results).some((arr) => arr.length > 0);
  return hasData ? results : null;
};

const MetadataDisplayPage: React.FC = () => {
  const location = window.location.pathname;
  const arkId = location.includes("/view/") ? location.split("/view/")[1] : "";

  const [view, setView] = useState<ViewType>("metadata");
  const [title, setTitle] = useState<string>("Data Display");
  const [version, setVersion] = useState<string>("1.0");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [evidenceGraph, setEvidenceGraph] = useState<RawGraphData | null>(null);
  const [supportData, setSupportData] = useState<SupportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [determinedType, setDeterminedType] = useState<string | null>(null);
  const [hasEvidenceGraph, setHasEvidenceGraph] = useState<boolean>(false);

  const { isLoggedIn } = useContext(AuthContext);
  const metadataServiceInstance = useMemo(() => metadataService(), []);

  useEffect(() => {
    const fetchData = async () => {
      if (!arkId) {
        setLoading(false);
        setError("No ARK ID provided");
        return;
      }
      setLoading(true);
      setError(null);
      setMetadata(null);
      setEvidenceGraph(null);
      setSupportData(null);

      try {
        const result = await metadataServiceInstance.fetchMetadata(arkId);
        if (result.error) {
          throw new Error(result.error);
        }

        setMetadata(result.metadata);
        setEvidenceGraph(result.evidenceGraph);
        setDeterminedType(result.type);
        setHasEvidenceGraph(result.hasEvidenceGraph);

        if (result.evidenceGraph) {
          const extractedSupport = extractSupportData(result.evidenceGraph);
          setSupportData(extractedSupport);
        }

        // Set title and version
        if (result.metadata) {
          const graph = result.metadata["@graph"];
          let rootName = "Details";
          let rootVersion = "1.0";
          if (graph && Array.isArray(graph)) {
            const rootEntity = findRootEntity(graph);
            if (rootEntity) {
              rootName = rootEntity.name || rootName;
              rootVersion = rootEntity.version || rootVersion;
            }
          } else if (
            graph &&
            typeof graph === "object" &&
            !Array.isArray(graph)
          ) {
            // Handle case where @graph is an object (likely RO-Crate)
            rootName = graph.name || rootName;
            rootVersion = graph.version || rootVersion;
          } else if (result.metadata.name) {
            // Fallback to top-level metadata fields
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

        setLoading(false);
      } catch (err: any) {
        setLoading(false);
        setError(err.message || "Failed to fetch data");
      }
    };

    fetchData();
  }, [arkId, isLoggedIn, metadataServiceInstance]);

  useEffect(() => {
    document.title = `${title} - FAIRSCAPE`;
  }, [title]);

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error)
      return <Alert type="error" title="Error Loading Data" message={error} />;

    if (view !== "graph" && !metadata) {
      return (
        <Alert
          type="info"
          title="No Metadata"
          message="Could not load metadata details."
        />
      );
    }

    switch (view) {
      case "metadata":
        if (!metadata)
          return (
            <Alert
              type="info"
              title="No Metadata"
              message="Could not load metadata details."
            />
          ); // Guard again
        const contentType = determinedType || "unknown";
        switch (contentType) {
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
                message={`Metadata display not configured for type: ${contentType}`}
              />
            );
        }

      case "serialization":
        if (!metadata)
          return (
            <Alert
              type="info"
              title="No Metadata"
              message="Could not load metadata details."
            />
          ); // Guard again
        return (
          <SerializationView
            json={JSON.stringify(metadata, null, 2)}
            rdfXml={null}
            turtle={null}
            showAllFormats={true}
          />
        );

      case "graph":
        if (!hasEvidenceGraph) {
          return (
            <Alert
              type="info"
              title="No Evidence Graph"
              message="No evidence graph is associated with this item."
            />
          );
        }
        return (
          <EvidenceGraphViewer
            evidenceGraphData={evidenceGraph}
            supportData={supportData}
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
          showEvidenceGraphButton={hasEvidenceGraph}
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
