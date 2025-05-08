import React, { useEffect, useState, useContext, useMemo } from "react"; // Added useMemo
import styled from "styled-components";

// Components
import EvidenceGraphViewer from "../components/EvidenceGraph/EvidenceGraphViewer";
import ButtonGroup from "../components/MetadataDisplay/ButtonGroup";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import ReleaseComponent from "../components/MetadataDisplay/ReleaseComponent";
import ROCrateComponent from "../components/MetadataDisplay/ROCrateComponent";
import GenericMetadataComponent from "../components/MetadataDisplay/GenericMetadataComponent";
import SerializationView from "../components/MetadataDisplay/SerializationView";

// Context, Services and Utilities
import { AuthContext } from "../context/AuthContext";
import metadataService from "../hooks/metadataService";
import {
  findRootEntity,
  determineReleaseType,
} from "../utils/metadataProcessing";

// Types
import { RawGraphData, Metadata } from "../types";

// Styled Components
const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.header`
  margin-bottom: 20px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: 15px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 20px;
  border-radius: 5px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.primary};
`;

const VersionInfo = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ButtonGroupContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

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

// View types
type ViewType = "metadata" | "serialization" | "graph";

const MetadataDisplayPage: React.FC = () => {
  // Extract ARK ID from URL path
  const location = window.location.pathname;
  const arkId = location.includes("/view/") ? location.split("/view/")[1] : "";

  // State
  const [view, setView] = useState<ViewType>("metadata");
  const [title, setTitle] = useState<string>("Data Display");
  const [version, setVersion] = useState<string>("1.0");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [evidenceGraph, setEvidenceGraph] = useState<RawGraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [determinedType, setDeterminedType] = useState<string | null>(null);
  const [hasEvidenceGraph, setHasEvidenceGraph] = useState<boolean>(false);

  // Get auth context
  const { isLoggedIn } = useContext(AuthContext);

  // Create instance of the metadata service, memoized to prevent re-creation on each render
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

      try {
        // Use the metadata service to fetch data
        const result = await metadataServiceInstance.fetchMetadata(arkId);

        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        // Update state with the result data
        setMetadata(result.metadata);
        setEvidenceGraph(result.evidenceGraph);
        setDeterminedType(result.type);
        setHasEvidenceGraph(result.hasEvidenceGraph);

        // Set title and version from metadata
        if (result.metadata) {
          if (
            result.metadata["@graph"] &&
            Array.isArray(result.metadata["@graph"])
          ) {
            const rootEntity = findRootEntity(result.metadata["@graph"]);
            if (rootEntity) {
              setTitle(
                rootEntity.name ||
                  `${
                    result.type.charAt(0).toUpperCase() + result.type.slice(1)
                  } Details`
              );
              setVersion(rootEntity.version || "1.0");
            } else {
              setTitle(
                `${
                  result.type.charAt(0).toUpperCase() + result.type.slice(1)
                } Details`
              );
            }
          } else {
            setTitle(
              result.metadata.name ||
                `${
                  result.type.charAt(0).toUpperCase() + result.type.slice(1)
                } Details`
            );
            setVersion(result.metadata.version || "1.0");
          }
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
    if (!metadata)
      return (
        <Alert type="info" title="No Data" message="Could not load metadata." />
      );

    switch (view) {
      case "metadata":
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
            return (
              <GenericMetadataComponent
                metadata={metadata}
                type="schema"
                arkId={arkId}
              />
            );
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
                type="info"
                title="Invalid View"
                message={`Unknown content type: ${contentType}`}
              />
            );
        }
      case "serialization":
        return (
          <SerializationView
            json={JSON.stringify(metadata, null, 2)}
            rdfXml={null}
            turtle={null}
            showAllFormats={true}
          />
        );
      case "graph":
        if (!evidenceGraph) {
          return (
            <Alert
              type="info"
              title="No Evidence Graph"
              message="Evidence graph data is not available for this item."
            />
          );
        }
        return <EvidenceGraphViewer evidenceGraphData={evidenceGraph} />;
      default:
        return (
          <Alert
            type="info"
            title="Invalid View"
            message={`Unknown view: ${view}`}
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
        2024.12.23.629818;
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
