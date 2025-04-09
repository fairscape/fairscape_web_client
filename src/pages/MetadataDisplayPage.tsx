// src/pages/MetadataDisplayPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

// Types and Components
import { RawGraphData, Metadata } from "../types";
import EvidenceGraphViewer from "../components/EvidenceGraph/EvidenceGraphViewer";
import ButtonGroup from "../components/MetadataDisplay/ButtonGroup";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import ReleaseComponent from "../components/MetadataDisplay/ReleaseComponent";
import ROCrateComponent from "../components/MetadataDisplay/ROCrateComponent";
import GenericMetadataComponent from "../components/MetadataDisplay/GenericMetadataComponent";
import SerializationView from "../components/MetadataDisplay/SerializationView";

// Utility functions
import {
  findRootEntity,
  determineReleaseType,
} from "../utils/metadataProcessing";

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
  const { viewType, arkId } = useParams<{ viewType: string; arkId: string }>();
  const [view, setView] = useState<ViewType>("metadata");
  const [title, setTitle] = useState<string>("Data Display");
  const [version, setVersion] = useState<string>("1.0");
  const [evidenceGraph, setEvidenceGraph] = useState<RawGraphData | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [determinedType, setDeterminedType] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Determine which data file to load based on viewType
        let dataUrl = "";
        switch (viewType) {
          case "release":
            dataUrl = "/data/release.json";
            break;
          case "rocrate":
            dataUrl = "/data/rocrate.json";
            break;
          case "dataset":
            dataUrl = "/data/dataset.json";
            break;
          case "software":
            dataUrl = "/data/software.json";
            break;
          case "computation":
            dataUrl = "/data/computation.json";
            break;
          case "schema":
            dataUrl = "/data/schema.json";
            break;
          default:
            dataUrl = "/data/release.json"; // Default to release.json
        }

        // Fetch the metadata
        const metadataResponse = await axios.get<Metadata>(dataUrl);
        const metadataData = metadataResponse.data;
        setMetadata(metadataData);

        if (metadataData) {
          // Use utility function to determine the type
          const type = determineReleaseType(metadataData);
          setDeterminedType(type);

          // Find the root entity to get the title and version
          if (metadataData["@graph"] && Array.isArray(metadataData["@graph"])) {
            const rootEntity = findRootEntity(metadataData["@graph"]);

            if (rootEntity) {
              setTitle(
                rootEntity.name ||
                  `${type.charAt(0).toUpperCase() + type.slice(1)} Details`
              );
              setVersion(rootEntity.version || "1.0");
            } else {
              setTitle(`${viewType} Details`);
            }
          } else {
            // If no graph, treat the metadata itself as the root
            setTitle(
              metadataData.name ||
                `${type.charAt(0).toUpperCase() + type.slice(1)} Details`
            );
            setVersion(metadataData.version || "1.0");
          }
        }

        // Try to fetch evidence graph data if available
        try {
          const graphResponse = await axios.get<RawGraphData>(
            "/data/evidence-graph.json"
          );
          setEvidenceGraph(graphResponse.data);
        } catch (err) {
          console.log("Evidence graph not available");
        }
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(`Failed to load data: ${err.message}`);
        setTitle(`${viewType} Details`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewType, arkId]);

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
        // Use determined type or fallback to viewType
        const contentType = determinedType || viewType;

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
        return evidenceGraph ? (
          <EvidenceGraphViewer evidenceGraphData={evidenceGraph} />
        ) : (
          <Alert
            type="info"
            title="No Evidence Graph"
            message="Evidence graph data is not available for this item."
          />
        );
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
          showEvidenceGraphButton={!!evidenceGraph}
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
