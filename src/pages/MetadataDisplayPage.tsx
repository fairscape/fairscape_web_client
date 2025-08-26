import React, { useEffect, useState, useContext, useMemo } from "react";
import styled from "styled-components";

import ButtonGroup from "../components/MetadataDisplay/ButtonGroup";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import ReleaseComponent from "../components/MetadataDisplay/ReleaseComponent";
import ROCrateComponent from "../components/MetadataDisplay/ROCrateComponent";
import GenericMetadataComponent from "../components/MetadataDisplay/GenericMetadataComponent";
import SerializationView from "../components/MetadataDisplay/SerializationView";
import EvidenceGraphDisplayController from "../components/MetadataDisplay/EvidenceGraphDisplayController";

import { AuthContext } from "../context/AuthContext";
import metadataService from "../hooks/metadataService";
import { useEvidenceGraphManager } from "../hooks/useEvidenceGraphManager";
import { findRootEntity } from "../utils/metadataProcessing";

import { RawGraphData, Metadata, RawGraphEntity } from "../types";

import {
  SupportingElement,
  SupportData,
} from "../components/EvidenceGraph/SupportingElementsComponent";

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

export const extractSupportData = (
  graphData: RawGraphData | null
): SupportData | null => {
  if (!graphData || !graphData["@graph"]) {
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
    return null;
  }
  const hasData = Object.values(results).some((arr) => arr.length > 0);
  return hasData ? results : null;
};

const CenteredMessageWithSpinner: React.FC<{ message: string }> = styled(
  ({ message, className }) => (
    <div
      className={className}
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
  )
)``;

const MetadataDisplayPage: React.FC = () => {
  const location = window.location.pathname;
  const arkId = location.includes("/view/") ? location.split("/view/")[1] : "";

  const [view, setView] = useState<ViewType>("metadata");
  const [title, setTitle] = useState<string>("Data Display");
  const [version, setVersion] = useState<string>("1.0");

  const [initialMetadata, setInitialMetadata] = useState<Metadata | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [determinedType, setDeterminedType] = useState<string | null>(null);
  const [initialHasEvidenceGraphLink, setInitialHasEvidenceGraphLink] =
    useState<boolean>(false);
  const [initialEvidenceGraphId, setInitialEvidenceGraphId] = useState<
    string | null
  >(null);

  const { isLoggedIn } = useContext(AuthContext);
  const metadataServiceInstance = useMemo(() => metadataService(), []);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!arkId) {
        setInitialLoading(false);
        setInitialError("No ARK ID provided");
        return;
      }
      setInitialLoading(true);
      setInitialError(null);
      setInitialMetadata(null);
      setDeterminedType(null);
      setInitialHasEvidenceGraphLink(false);
      setInitialEvidenceGraphId(null);

      try {
        const result = await metadataServiceInstance.fetchInitialMetadata(
          arkId
        );
        if (result.error) throw new Error(result.error);

        setInitialMetadata(result.metadata);
        setDeterminedType(result.type);
        setInitialHasEvidenceGraphLink(result.hasEvidenceGraph);
        setInitialEvidenceGraphId(result.evidenceGraphId);

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
      } catch (err: any) {
        setInitialError(err.message || "Failed to fetch initial data");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [arkId, metadataServiceInstance]);

  const {
    hasEvidenceGraphLink,
    currentEvidenceGraphId,
    evidenceGraphData,
    supportData,
    graphBuildStatus,
    currentTaskId,
    evidenceGraphError,
    updatedMetadata,
    isLoading: isGraphManagerLoading,
  } = useEvidenceGraphManager({
    arkId: arkId || null,
    initialHasLink: initialHasEvidenceGraphLink,
    initialGraphId: initialEvidenceGraphId,
    initialMetadata: initialMetadata,
    isLoggedIn,
    itemType: determinedType,
    extractSupportData,
  });

  const displayMetadata = updatedMetadata || initialMetadata;

  useEffect(() => {
    document.title = `${title} - FAIRSCAPE`;
  }, [title]);

  const renderContent = () => {
    if (initialLoading)
      return <CenteredMessageWithSpinner message="Loading metadata..." />;
    if (initialError)
      return (
        <Alert type="error" title="Error Loading Data" message={initialError} />
      );

    if (view !== "graph" && !displayMetadata) {
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
        if (!displayMetadata)
          return (
            <CenteredMessageWithSpinner message="Loading metadata details..." />
          );
        const metaType = determinedType || "unknown";
        switch (metaType) {
          case "release":
            return (
              <ReleaseComponent metadata={displayMetadata} arkId={arkId} />
            );
          case "rocrate":
            return (
              <ROCrateComponent metadata={displayMetadata} arkId={arkId} />
            );
          case "dataset":
          case "evi:dataset":
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="dataset"
                arkId={arkId}
              />
            );
          case "software":
          case "evi:software":
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="software"
                arkId={arkId}
              />
            );
          case "computation":
          case "evi:computation":
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="computation"
                arkId={arkId}
              />
            );
          case "schema":
          case "evi:schema":
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="schema"
                arkId={arkId}
              />
            );
          case "instrument":
          case "evi:instrument":
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="instrument"
                arkId={arkId}
              />
            );
          case "sample":
          case "evi:sample":
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="sample"
                arkId={arkId}
              />
            );
          case "experiment":
          case "evi:experiment":
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="experiment"
                arkId={arkId}
              />
            );
          case "biochementity":
          case "evi:biochementity":
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="biochementity"
                arkId={arkId}
              />
            );
          default:
            return (
              <GenericMetadataComponent
                metadata={displayMetadata}
                type="unknown"
                arkId={arkId}
              />
            );
        }

      case "serialization":
        if (!displayMetadata)
          return (
            <CenteredMessageWithSpinner message="Loading serialization data..." />
          );
        return (
          <SerializationView
            json={JSON.stringify(displayMetadata, null, 2)}
            rdfXml={null}
            turtle={null}
            showAllFormats={true}
          />
        );

      case "graph":
        // For RO-Crate, show the graph directly here
        if (determinedType === "rocrate") {
          return (
            <EvidenceGraphDisplayController
              isGraphManagerLoading={isGraphManagerLoading}
              graphBuildStatus={graphBuildStatus}
              currentTaskId={currentTaskId}
              evidenceGraphData={evidenceGraphData}
              currentEvidenceGraphId={currentEvidenceGraphId}
              evidenceGraphError={evidenceGraphError}
              supportData={supportData}
              isLoggedIn={isLoggedIn}
              determinedType={determinedType}
              hasEvidenceGraphLink={hasEvidenceGraphLink}
            />
          );
        }
        return (
          <EvidenceGraphDisplayController
            isGraphManagerLoading={isGraphManagerLoading}
            graphBuildStatus={graphBuildStatus}
            currentTaskId={currentTaskId}
            evidenceGraphData={evidenceGraphData}
            currentEvidenceGraphId={currentEvidenceGraphId}
            evidenceGraphError={evidenceGraphError}
            supportData={supportData}
            isLoggedIn={isLoggedIn}
            determinedType={determinedType}
            hasEvidenceGraphLink={hasEvidenceGraphLink}
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

  const showEvidenceGraphButtonCondition =
    hasEvidenceGraphLink ||
    graphBuildStatus === "INITIATING" ||
    graphBuildStatus === "POLLING" ||
    graphBuildStatus === "SUCCESS" ||
    (isLoggedIn &&
      determinedType &&
      !["release"].includes(determinedType) && // Only exclude "release", not "rocrate"
      (graphBuildStatus === "IDLE" || graphBuildStatus === "TIMED_OUT"));

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
          showEvidenceGraphButton={!!showEvidenceGraphButtonCondition}
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
