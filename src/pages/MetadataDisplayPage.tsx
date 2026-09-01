import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";

import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import ReleaseComponent from "../components/MetadataDisplay/views/Release/ReleaseComponent";
import ROCrateComponent from "../components/MetadataDisplay/views/ROCrate/ROCrateComponent";
import GenericMetadataComponent from "../components/MetadataDisplay/views/Generic/GenericMetadataComponent";
import SerializationView from "../components/MetadataDisplay/views/Serialization/SerializationView";
import EvidenceGraphViewer from "../components/EvidenceGraph/EvidenceGraphViewer";
import AnnotatedGraphViewer from "../components/AnnotatedGraph/AnnotatedGraphViewer";
import AnnotatedSummaryCards from "../components/AnnotatedGraph/AnnotatedSummaryCards";
import MetadataNavigationSidebar from "../components/MetadataDisplay/components/MetadataNavigationSidebar";
import AIReadyScoreView from "../components/MetadataDisplay/views/AIReadyScore/AIReadyScoreView";
import StatisticsViewer from "../components/MetadataDisplay/views/Statistics/StatisticsViewer";
import InterpretationStatusView from "../components/MetadataDisplay/views/Interpretation/InterpretationStatusView";
import SchemaExplorerView from "../components/MetadataDisplay/views/SchemaExplorer/SchemaExplorerView";

import { AuthContext } from "../context/AuthContext";

import { useMetadataBundle } from "../components/MetadataDisplay/hooks/useMetadataBundle";
import { useDownloads } from "../components/MetadataDisplay/hooks/useDownloads";
import { deriveTitleAndVersion } from "../components/MetadataDisplay/utils/title";
import { useHttp } from "../components/MetadataDisplay/api/httpClient";
import { TypeTag, ArkId, Mono } from "../components/shared/DirectionA";

type ViewType =
  | "metadata"
  | "serialization"
  | "graph"
  | "score"
  | "statistics"
  | "interpretation"
  | "schema";

const FullWidthWrapper = styled.div`
  margin-left: calc(-1 * ${({ theme }) => theme.spacing.lg});
  margin-right: calc(-1 * ${({ theme }) => theme.spacing.lg});
  width: calc(100% + 2 * ${({ theme }) => theme.spacing.lg});

  /* main's padding shrinks to spacing.md on mobile - mirror it here */
  @media (max-width: 768px) {
    margin-left: calc(-1 * ${({ theme }) => theme.spacing.md});
    margin-right: calc(-1 * ${({ theme }) => theme.spacing.md});
    width: calc(100% + 2 * ${({ theme }) => theme.spacing.md});
  }
`;

const PageContainer = styled.div`
  display: flex;
  gap: 30px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }

  @media (max-width: 768px) {
    padding: 12px 0;
    gap: 20px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const Container = styled.div`
  background-color: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 28px 32px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Header = styled.header`
  margin-bottom: 24px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.ink};
  padding-bottom: 20px;
`;

const PartOfInfo = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.ink3};
  margin-bottom: 14px;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: ${({ theme }) => theme.colors.ink};
`;

const IdRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const ImagePreviewSection = styled.div`
  margin: 20px 0;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  display: block;
  background-color: #f5f5f5;
`;

const FigureLegend = styled.div`
  padding: 12px 15px;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-style: italic;
`;

const Footer = styled.footer`
  margin-top: 30px;
  padding: 18px 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.ink3};
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

const getImageUrlFromBundle = (bundle: any, metadata: any): string | null => {
  const path = bundle?.distribution?.location?.path;
  if (!path) return null;

  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
  const hasImageExtension = imageExtensions.some((ext) =>
    path.toLowerCase().endsWith(ext),
  );

  if (!hasImageExtension) return null;

  // Return the contentUrl if available
  const contentUrl = metadata?.contentUrl;
  return contentUrl || null;
};

export default function MetadataDisplayPage() {
  const params = useParams<{ arkId?: string }>();
  const arkId =
    params?.arkId ??
    (window.location.pathname.includes("/view/")
      ? window.location.pathname.split("/view/")[1]
      : "");

  const { isLoggedIn } = useContext(AuthContext);

  const [view, setView] = useState<ViewType>(() => {
    const saved = sessionStorage.getItem(`fairscape-view-${arkId}`);
    if (saved) {
      sessionStorage.removeItem(`fairscape-view-${arkId}`);
      return saved as ViewType;
    }
    return "metadata";
  });
  const { bundle, loading, error } = useMetadataBundle(arkId);
  const contentRef = useRef<HTMLDivElement>(null);
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
  const http = useHttp();

  // Resolve the crate this object is part of so the header can name it.
  const [parentCrate, setParentCrate] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!bundle) {
      setParentCrate(null);
      return;
    }
    const collect = (node: any): any[] => {
      if (!node) return [];
      if (Array.isArray(node.isPartOf)) return node.isPartOf;
      const graph = node["@graph"];
      if (Array.isArray(graph)) {
        for (const entry of graph) {
          if (entry && Array.isArray(entry.isPartOf) && entry.isPartOf.length) {
            return entry.isPartOf;
          }
        }
      }
      return [];
    };
    const candidates = [
      ...(Array.isArray(bundle.isPartOf) ? bundle.isPartOf : []),
      ...collect(bundle.main),
      ...collect(bundle.rocrate),
    ];
    const seen = new Set<string>();
    const unique = candidates.filter((entry: any) => {
      const id = entry?.["@id"];
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    if (unique.length === 0) {
      setParentCrate(null);
      return;
    }
    (async () => {
      const resolved = await Promise.all(
        unique.map(async (entry: any) => {
          try {
            const data = await http(
              `/rocrate/view/${encodeURIComponent(entry["@id"])}`,
            );
            const name =
              data?.metadata?.name || data?.name || entry.name || "RO-Crate";
            return { id: entry["@id"], name };
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;
      const found = resolved.filter(Boolean) as { id: string; name: string }[];
      setParentCrate(found.length ? found[found.length - 1] : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [bundle, http]);

  const { downloadZip, downloadJSON, downloadCroissant, downloadHTML } =
    useDownloads({
      arkId,
      bundle,
      contentRef,
    });

  const { title, version } = useMemo(
    () => deriveTitleAndVersion(bundle?.rocrate ?? bundle?.main),
    [bundle],
  );

  const metadata = useMemo(() => bundle?.rocrate ?? bundle?.main, [bundle]);

  const hasDistribution = useMemo(() => !!bundle?.distribution, [bundle]);

  const hasContentUrl = useMemo(() => !!metadata?.contentUrl, [metadata]);

  const hasStatistics = useMemo(
    () =>
      !!bundle?.descriptiveStatistics &&
      Object.keys(bundle.descriptiveStatistics).length > 0,
    [bundle],
  );

  useEffect(() => {
    document.title = `${title} - FAIRSCAPE`;
  }, [title]);

  useEffect(() => {
    if (!metadata) return;

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "fairscape-jsonld";
    script.textContent = JSON.stringify(metadata);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById("fairscape-jsonld");
      if (existing) existing.remove();
    };
  }, [metadata]);

  // Fetch image with authentication if available
  useEffect(() => {
    let isMounted = true;
    let blobUrl: string | null = null;

    const fetchImage = async () => {
      if (!bundle || bundle.kind !== "dataset") {
        setImageBlobUrl(null);
        return;
      }

      const imageUrl = getImageUrlFromBundle(bundle, metadata);
      if (!imageUrl) {
        setImageBlobUrl(null);
        return;
      }

      try {
        const blob = await http(imageUrl, {
          credentials: "include",
          responseType: "blob",
        });

        if (isMounted) {
          blobUrl = URL.createObjectURL(blob);
          setImageBlobUrl(blobUrl);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        if (isMounted) {
          setImageBlobUrl(null);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [bundle, metadata, http]);

  const isOwner = true;

  const hasAnnotatedEvidenceGraph = !!bundle?.evidence?.isAnnotated;

  const handleInterpret = useCallback(() => {
    setView("interpretation");
  }, []);

  const handleViewExistingGraph = useCallback(() => {
    setView("graph");
  }, []);

  const handleInterpretSuccess = useCallback(() => {
    sessionStorage.setItem(`fairscape-view-${arkId}`, "graph");
    window.location.reload();
  }, [arkId]);

  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);

  const handleHighlightNode = useCallback((nodeId: string) => {
    setHighlightNodeId(nodeId);
    // Auto-clear after animation
    setTimeout(() => setHighlightNodeId(null), 3000);
  }, []);

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
              2,
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

        // Annotated evidence graph path
        if (bundle.evidence.isAnnotated && bundle.evidence.annotatedData) {
          const rawGraphData = {
            "@graph": bundle.evidence.annotatedData["@graph"],
          };
          return (
            <AnnotatedSummaryCards
              data={bundle.evidence.annotatedData}
              graphElement={
                <AnnotatedGraphViewer
                  graphData={rawGraphData}
                  highlightNodeId={highlightNodeId}
                />
              }
              onHighlightNode={handleHighlightNode}
            />
          );
        }

        // Regular evidence graph path (unchanged)
        return (
          <EvidenceGraphViewer
            evidenceGraphData={bundle.evidence.data ?? null}
            supportData={bundle.evidence.supportData}
          />
        );
      }

      case "score":
        return <AIReadyScoreView arkId={arkId} />;

      case "interpretation":
        return (
          <InterpretationStatusView
            arkId={arkId}
            hasExisting={hasAnnotatedEvidenceGraph}
            onSuccess={handleInterpretSuccess}
            onViewExisting={handleViewExistingGraph}
          />
        );

      case "statistics":
        if (!bundle.descriptiveStatistics) {
          return (
            <Alert
              type="info"
              title="Statistics"
              message="No descriptive statistics available for this dataset."
            />
          );
        }
        return (
          <StatisticsViewer
            descriptiveStatistics={bundle.descriptiveStatistics}
            splitStatistics={bundle.splitStatistics}
          />
        );

      case "schema":
        return (
          <SchemaExplorerView
            metadata={bundle.rocrate ?? bundle.main}
            bundleKind={bundle.kind}
          />
        );

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
              {parentCrate && (
                <PartOfInfo>
                  Part of:{" "}
                  <Link to={`/view/${parentCrate.id}`}>{parentCrate.name}</Link>
                </PartOfInfo>
              )}
              <TitleRow>
                <PageTitle>{title}</PageTitle>
                {bundle?.kind && (
                  <TypeTag>
                    {bundle.kind === "rocrate" ? "RO-Crate" : bundle.kind}
                  </TypeTag>
                )}
              </TitleRow>
              <IdRow>
                <ArkId>{arkId}</ArkId>
                <Mono>v{version}</Mono>
              </IdRow>
            </Header>

            {imageBlobUrl && view === "metadata" && (
              <ImagePreviewSection>
                <PreviewImage
                  src={imageBlobUrl}
                  alt={title}
                  onError={(e) => {
                    // Hide image if it fails to load
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                {metadata?.description && (
                  <FigureLegend>{metadata.description}</FigureLegend>
                )}
              </ImagePreviewSection>
            )}

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
            hasStatistics={hasStatistics}
            isLoggedIn={!!isLoggedIn}
            onInterpret={handleInterpret}
          />
        )}
      </PageContainer>
    </FullWidthWrapper>
  );
}
