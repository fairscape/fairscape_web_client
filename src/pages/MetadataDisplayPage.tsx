import React, { useMemo, useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";

import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import ReleaseComponent from "../components/MetadataDisplay/views/Release/ReleaseComponent";
import ROCrateComponent from "../components/MetadataDisplay/views/ROCrate/ROCrateComponent";
import GenericMetadataComponent from "../components/MetadataDisplay/views/Generic/GenericMetadataComponent";
import SerializationView from "../components/MetadataDisplay/views/Serialization/SerializationView";
import EvidenceGraphViewer from "../components/EvidenceGraph/EvidenceGraphViewer";
import MetadataNavigationSidebar from "../components/MetadataDisplay/components/MetadataNavigationSidebar";
import AIReadyScoreView from "../components/MetadataDisplay/views/AIReadyScore/AIReadyScoreView";
import StatisticsViewer from "../components/MetadataDisplay/views/Statistics/StatisticsViewer";

import { useMetadataBundle } from "../components/MetadataDisplay/hooks/useMetadataBundle";
import { useDownloads } from "../components/MetadataDisplay/hooks/useDownloads";
import { deriveTitleAndVersion } from "../components/MetadataDisplay/utils/title";
import { nicuDataset } from "../components/MetadataDisplay/views/Statistics/nicuDataset";

type ViewType = "metadata" | "serialization" | "graph" | "score" | "statistics";

const PageContainer = styled.div`
  display: flex;
  gap: 30px;
  margin: 0 auto;
  padding: 20px;
`;

const FullWidthWrapper = styled.div`
  margin-left: calc(-1 * ${({ theme }) => theme.spacing.lg});
  margin-right: calc(-1 * ${({ theme }) => theme.spacing.lg});
  width: calc(100% + 2 * ${({ theme }) => theme.spacing.lg});
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const Container = styled.div`
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
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
  const params = useParams<{ arkId?: string }>();
  const arkId =
    params?.arkId ??
    (window.location.pathname.includes("/view/")
      ? window.location.pathname.split("/view/")[1]
      : "");

  const [view, setView] = useState<ViewType>("metadata");
  const { bundle, loading, error } = useMetadataBundle(arkId);
  const contentRef = useRef<HTMLDivElement>(null);

  const { downloadZip, downloadJSON, downloadCroissant, downloadHTML } =
    useDownloads({
      arkId,
      bundle,
      contentRef,
    });

  const { title, version } = useMemo(
    () => deriveTitleAndVersion(bundle?.rocrate ?? bundle?.main),
    [bundle]
  );

  const metadata = useMemo(() => bundle?.rocrate ?? bundle?.main, [bundle]);

  const hasDistribution = useMemo(() => !!bundle?.distribution, [bundle]);

  const hasContentUrl = useMemo(() => !!metadata?.contentUrl, [metadata]);

  useEffect(() => {
    document.title = `${title} - FAIRSCAPE`;
  }, [title]);

  const isOwner = true;

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

      case "score":
        return <AIReadyScoreView arkId={arkId} />;

      case "statistics":
        return <StatisticsViewer dataset={nicuDataset} />;

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
    <FullWidthWrapper>
      <PageContainer>
        <ContentWrapper>
          <Container ref={contentRef}>
            <Header>
              <PageTitle>{title}</PageTitle>
              <VersionInfo>Version: {version}</VersionInfo>
            </Header>

            {renderContent()}

            <Footer>
              Metadata &amp; Provenance: This metadata and provenance were
              generated by the FAIRSCAPE AI-readiness platform (Al Manir, et al.
              a2024, BioRXiv 2024.12.23.629818;{" "}
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
        </ContentWrapper>

        {bundle && (
          <MetadataNavigationSidebar
            activeView={view}
            onViewChange={setView}
            arkId={arkId}
            bundleKind={bundle.kind}
            isOwner={isOwner}
            downloadZip={downloadZip}
            downloadJSON={downloadJSON}
            downloadCroissant={downloadCroissant}
            downloadHTML={downloadHTML}
            hasDistribution={hasDistribution}
            hasContentUrl={hasContentUrl}
          />
        )}
      </PageContainer>
    </FullWidthWrapper>
  );
}
