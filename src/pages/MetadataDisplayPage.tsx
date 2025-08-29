import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";

import ButtonGroup from "../components/MetadataDisplay/components/ButtonGroup/ButtonGroup";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import ReleaseComponent from "../components/MetadataDisplay/ReleaseComponent";
import ROCrateComponent from "../components/MetadataDisplay/ROCrateComponent";
import GenericMetadataComponent from "../components/MetadataDisplay/GenericMetadataComponent";
import SerializationView from "../components/MetadataDisplay/views/Serialization/SerializationView";
import EvidenceGraphViewer from "../components/EvidenceGraph/EvidenceGraphViewer";

import { useMetadataBundle } from "../components/MetadataDisplay/hooks/useMetadataBundle";
import { deriveTitleAndVersion } from "../components/MetadataDisplay/utils/title";

type ViewType = "metadata" | "serialization" | "graph";

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
  }
  a:hover {
    text-decoration: underline;
  }
`;

const CenteredMessage: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
    }}
  >
    <LoadingSpinner />
    <p style={{ marginTop: 10, color: "#666", textAlign: "center" }}>
      {message}
    </p>
  </div>
);

export default function MetadataDisplayPage() {
  // Prefer router param but fall back to window path
  const params = useParams<{ arkId?: string }>();
  const arkId =
    params?.arkId ??
    (window.location.pathname.includes("/view/")
      ? window.location.pathname.split("/view/")[1]
      : "");

  const [view, setView] = useState<ViewType>("metadata");
  const { bundle, loading, error } = useMetadataBundle(arkId);

  const { title, version } = useMemo(
    () => deriveTitleAndVersion(bundle?.rocrate ?? bundle?.main),
    [bundle]
  );

  useEffect(() => {
    document.title = `${title} - FAIRSCAPE`;
  }, [title]);

  const showGraphButton = !!bundle && bundle.kind !== "release";

  function renderContent() {
    if (loading) return <CenteredMessage message="Loading metadata..." />;
    if (error)
      return <Alert type="error" title="Error Loading Data" message={error} />;
    if (!bundle)
      return (
        <Alert type="info" title="No Data" message="Nothing to display." />
      );

    switch (view) {
      case "metadata": {
        const m = bundle.rocrate ?? bundle.main;
        switch (bundle.kind) {
          case "release":
            return <ReleaseComponent metadata={m} arkId={arkId} />;
          case "rocrate":
            return <ROCrateComponent metadata={m} arkId={arkId} />;
          case "dataset":
          case "software":
          case "computation":
          case "schema":
          case "instrument":
          case "sample":
          case "experiment":
          case "biochementity":
          default:
            return (
              <GenericMetadataComponent
                metadata={m}
                type={(bundle.kind as any) ?? "unknown"}
                arkId={arkId}
              />
            );
        }
      }

      case "serialization":
        return (
          <SerializationView
            json={JSON.stringify(
              bundle.serializations?.json ?? bundle.main,
              null,
              2
            )}
            rdfXml={bundle.serializations?.rdfXml ?? null}
            turtle={bundle.serializations?.turtle ?? null}
            showAllFormats={true}
          />
        );

      case "graph": {
        if (!bundle.evidence) {
          return (
            <Alert
              type="info"
              title="Evidence Graph"
              message="No evidence information available."
            />
          );
        }
        if (bundle.evidence.status === "failed") {
          return (
            <Alert
              type="error"
              title="Evidence Graph"
              message={
                bundle.evidence.error || "Failed to build evidence graph."
              }
            />
          );
        }
        return (
          <EvidenceGraphViewer
            evidenceGraphData={bundle.evidence.data ?? null}
            supportData={bundle.evidence.supportData}
          />
        );
      }

      default:
        return (
          <Alert
            type="error"
            title="Invalid View"
            message={`Unknown view: ${view}`}
          />
        );
    }
  }

  return (
    <Container>
      <Header>
        <PageTitle>{title}</PageTitle>
        <VersionInfo>Version: {version}</VersionInfo>
      </Header>

      <ButtonGroupContainer>
        <ButtonGroup
          currentView={view}
          onSelectView={(v) => setView(v as ViewType)}
          showEvidenceGraphButton={showGraphButton}
          showExplorerButton={bundle?.kind === "dataset"}
          explorerArkId={arkId}
        />
      </ButtonGroupContainer>

      {renderContent()}

      <Footer>
        Metadata &amp; Provenance: This metadata and provenance were generated
        by the FAIRSCAPE AI-readiness platform (Al Manir, et al. a2024, BioRXiv
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
}
