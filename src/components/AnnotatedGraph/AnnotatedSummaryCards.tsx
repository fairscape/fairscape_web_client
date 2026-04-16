import React, { useState, useMemo } from "react";
import styled from "styled-components";
import {
  AnnotatedEvidenceGraphData,
  GraphAssumption,
  AssumptionImpact,
  GraphConcern,
  ConcernLevel,
  normalizeImpact,
} from "../../types/graph";

// ---------------------------------------------------------------------------
// Backward-compat: map old concern data to assumption shape
// ---------------------------------------------------------------------------

function mapConcernToAssumption(c: GraphConcern): GraphAssumption {
  return {
    impact: normalizeImpact(c.level),
    description: c.description,
    sourceAnnotation: c.sourceAnnotation,
  };
}

function normalizeAssumption(a: GraphAssumption): GraphAssumption {
  return { ...a, impact: normalizeImpact(a.impact) };
}

function getAssumptions(data: AnnotatedEvidenceGraphData): GraphAssumption[] {
  if (data["evi:assumptions"] && data["evi:assumptions"].length > 0) {
    return data["evi:assumptions"].map(normalizeAssumption);
  }
  if (data["evi:concerns"] && data["evi:concerns"].length > 0) {
    return data["evi:concerns"].map(mapConcernToAssumption);
  }
  return [];
}

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const SummarySection = styled.div`
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const SummaryHeader = styled.div<{ $expanded: boolean }>`
  padding: 12px 16px;
  background: #f7f9fc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;

  h3 {
    margin: 0;
    font-size: 15px;
    color: #2c3e50;
  }
  .toggle {
    color: #95a5a6;
    font-size: 12px;
  }

  &:hover {
    background: #eef2f7;
  }
`;

const SummaryBody = styled.div`
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
`;

const AssumptionsList = styled.div`
  .assumption-item {
    margin: 4px 0;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
  }
  .assumption-critical {
    background: #f3e8f9;
    border-left: 4px solid #7b2d8e;
  }
  .assumption-major {
    background: #fef9e7;
    border-left: 4px solid #d68910;
  }
  .assumption-minor {
    background: #eaf4fb;
    border-left: 4px solid #1a5276;
  }
  .assumption-level-badge {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 3px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .badge-critical { background: #7b2d8e; color: #fff; }
  .badge-major { background: #d68910; color: #fff; }
  .badge-minor { background: #1a5276; color: #fff; }
  .assumption-source {
    flex-shrink: 0;
    font-size: 11px;
    color: #888;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .assumption-source-icon {
    font-size: 13px;
  }
`;

const AssumptionRow = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  &:hover {
    filter: brightness(0.95);
  }
`;

const AssumptionChevron = styled.span`
  font-size: 10px;
  color: #999;
  flex-shrink: 0;
  margin-top: 2px;
  width: 12px;
`;

const AssumptionName = styled.span`
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
`;

const AssumptionDetails = styled.div`
  padding: 4px 12px 10px 32px;
  font-size: 12.5px;
  color: #555;
  line-height: 1.5;

  .detail-section {
    margin-bottom: 6px;
  }
  .detail-label {
    font-weight: 600;
    color: #666;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .downstream-impacts {
    background: #fff8e1;
    border-left: 3px solid #ffb300;
    padding: 4px 8px;
    border-radius: 2px;
    margin-top: 2px;
  }
  .evidence-link {
    color: #007bff;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const ImpactGroupHeader = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0 4px;
  cursor: pointer;
  user-select: none;

  &:first-child { padding-top: 0; }

  .group-label {
    font-size: 13px;
    font-weight: 600;
    color: ${(props) => props.$color};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .group-count {
    font-size: 12px;
    color: #888;
  }
  .group-toggle {
    font-size: 10px;
    color: #95a5a6;
  }

  &:hover .group-label { opacity: 0.8; }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;

  span {
    color: #333;
    font-weight: 500;
  }
`;

const OverviewContent = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #333;

  .overview-description {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
  }
  .overview-row {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 6px;
  }
  .overview-label {
    font-weight: 600;
    color: #666;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    min-width: 70px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .overview-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .overview-tag {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 12px;
    font-size: 12px;
    background: #e8f0fe;
    color: #1a5276;
  }
  .overview-license-link {
    color: #007bff;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
  .overview-assumption {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-right: 12px;
  }
`;

const PipelineStepsContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li {
    margin: 2px 0;
  }
`;

const AudienceButton = styled.button<{ $active: boolean }>`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${(props) => (props.$active ? "#2c3e50" : "#dee2e6")};
  background: ${(props) => (props.$active ? "#2c3e50" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#555")};
  transition: all 0.15s ease;

  &:hover {
    border-color: #2c3e50;
    opacity: 0.85;
  }
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAssumptionCssClass(a: GraphAssumption): string {
  switch (a.impact) {
    case "CRITICAL": return "critical";
    case "MAJOR": return "major";
    default: return "minor";
  }
}

function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <SummaryCard>
      <SummaryHeader
        $expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <h3>{title}</h3>
        <span className="toggle">{expanded ? "\u25BC" : "\u25B6"}</span>
      </SummaryHeader>
      {expanded && <SummaryBody>{children}</SummaryBody>}
    </SummaryCard>
  );
}

function GraphCard({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return (
    <SummaryCard>
      <SummaryHeader
        $expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <h3>{title}</h3>
        <span className="toggle">{expanded ? "\u25BC" : "\u25B6"}</span>
      </SummaryHeader>
      {expanded && <div style={{ padding: 4 }}>{children}</div>}
    </SummaryCard>
  );
}

// ---------------------------------------------------------------------------
// Expandable assumption item
// ---------------------------------------------------------------------------

function AssumptionItem({
  assumption,
  sourceLabel,
  onHighlightNode,
  data,
}: {
  assumption: GraphAssumption;
  sourceLabel: string;
  onHighlightNode?: (nodeId: string) => void;
  data: AnnotatedEvidenceGraphData;
}) {
  const [expanded, setExpanded] = useState(false);
  const cssClass = getAssumptionCssClass(assumption);
  const displayName = assumption.name || (assumption.description.length > 80
    ? assumption.description.slice(0, 80) + "..."
    : assumption.description);

  const rocrateId = data["evi:annotates"]?.["@id"];
  const sourceId = assumption.sourceAnnotation?.["@id"];
  const isPipelineWide = sourceId === rocrateId;

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onHighlightNode && sourceId && !isPipelineWide) {
      onHighlightNode(sourceId);
    }
  };

  const isReviewRecommended = assumption.reviewRecommended === true;

  return (
    <div className={`assumption-item assumption-${cssClass}`} style={!isReviewRecommended ? { opacity: 0.7 } : undefined}>
      <AssumptionRow onClick={() => setExpanded(!expanded)}>
        <AssumptionChevron>{expanded ? "\u25BC" : "\u25B6"}</AssumptionChevron>
        <span className={`assumption-level-badge badge-${cssClass}`}>
          {assumption.impact.slice(0, 5)}
        </span>
        <AssumptionName>{displayName}</AssumptionName>
        {isReviewRecommended && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "#8e44ad", background: "#f3e8f9", padding: "1px 6px", borderRadius: 3, flexShrink: 0 }}>
            Review suggested
          </span>
        )}
        <span
          className="assumption-source"
          onClick={handleSourceClick}
          title={onHighlightNode && sourceId && !isPipelineWide ? `Click to highlight: ${sourceLabel}` : undefined}
          style={onHighlightNode && sourceId && !isPipelineWide ? { cursor: "pointer", color: "#555" } : undefined}
        >
          {sourceLabel}
          {onHighlightNode && sourceId && !isPipelineWide && (
            <span className="assumption-source-icon">&rarr;</span>
          )}
        </span>
      </AssumptionRow>

      {expanded && (
        <AssumptionDetails>
          {assumption.name && (
            <div className="detail-section">
              <div className="detail-label">Description</div>
              <div>{assumption.description}</div>
            </div>
          )}

          {assumption.downstreamImpacts && (
            <div className="detail-section">
              <div className="detail-label">If Wrong</div>
              <div className="downstream-impacts">{assumption.downstreamImpacts}</div>
            </div>
          )}

          {assumption.evidence && (
            <div className="detail-section">
              <div className="detail-label">Evidence</div>
              <div>
                {assumption.evidence.artifact?.["@id"] ? (
                  <a
                    className="evidence-link"
                    href={`/view/${assumption.evidence.artifact["@id"]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {assumption.evidence.artifact["@id"]}
                  </a>
                ) : (
                  <span>Unknown artifact</span>
                )}
                {assumption.evidence.location && (
                  <span style={{ color: "#888", marginLeft: 6 }}>
                    ({assumption.evidence.location})
                  </span>
                )}
              </div>
            </div>
          )}

          {assumption.recommendedValidation && (
            <div className="detail-section">
              <div className="detail-label">How to Validate</div>
              <div style={{ background: "#e8f5e9", borderLeft: "3px solid #43a047", padding: "4px 8px", borderRadius: 2, marginTop: 2 }}>
                {assumption.recommendedValidation}
              </div>
            </div>
          )}
        </AssumptionDetails>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main types & helpers
// ---------------------------------------------------------------------------

interface AnnotatedSummaryCardsProps {
  data: AnnotatedEvidenceGraphData;
  graphElement: React.ReactNode;
  onHighlightNode?: (nodeId: string) => void;
}

const IMPACT_ORDER: AssumptionImpact[] = ["CRITICAL", "MAJOR", "MINOR"];
const IMPACT_COLORS: Record<AssumptionImpact, string> = {
  CRITICAL: "#7b2d8e",
  MAJOR: "#d68910",
  MINOR: "#1a5276",
};

function getSourceLabel(
  assumption: GraphAssumption,
  data: AnnotatedEvidenceGraphData,
): string {
  const sourceId = assumption.sourceAnnotation?.["@id"];
  if (!sourceId) return "";
  const rocrateId = data["evi:annotates"]?.["@id"];
  if (sourceId === rocrateId) return "Full Pipeline";
  const graph = data["@graph"] || {};
  const annotationEntity = graph[sourceId];
  if (annotationEntity) {
    const annotatesId = annotationEntity["evi:annotates"]?.["@id"];
    if (annotatesId && graph[annotatesId]) {
      return graph[annotatesId].name || annotatesId;
    }
    return annotationEntity.name || sourceId;
  }
  return sourceId;
}

// ---------------------------------------------------------------------------
// Audience data resolution
// ---------------------------------------------------------------------------

interface ResolvedPerspective {
  assumptions: GraphAssumption[];
}

function resolveAudience(
  data: AnnotatedEvidenceGraphData,
  audienceKey: string,
): ResolvedPerspective | null {
  if (audienceKey === "datasci") {
    return {
      assumptions: getAssumptions(data),
    };
  }
  const audiences = data["evi:audiences"] || [];
  const match = audiences.find((a) => a.targetAudience === audienceKey);
  if (!match) return null;
  return {
    assumptions: (match.assumptions || []).map(normalizeAssumption),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AUDIENCE_OPTIONS = [
  { key: "datasci", label: "Data Scientist" },
  { key: "biostat", label: "Biostatistician" },
  { key: "clinician", label: "Clinician" },
];

const AnnotatedSummaryCards: React.FC<AnnotatedSummaryCardsProps> = ({
  data,
  graphElement,
  onHighlightNode,
}) => {
  const [selectedAudience, setSelectedAudience] = useState("datasci");
  const [expandedGroups, setExpandedGroups] = useState<Set<AssumptionImpact>>(
    () => new Set(["CRITICAL"])
  );

  const toggleGroup = (impact: AssumptionImpact) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(impact)) {
        next.delete(impact);
      } else {
        next.add(impact);
      }
      return next;
    });
  };

  const perspective = useMemo(
    () => resolveAudience(data, selectedAudience),
    [data, selectedAudience],
  );

  const assumptions = perspective?.assumptions || [];

  const groupedAssumptions = useMemo(() => {
    const groups: Record<AssumptionImpact, GraphAssumption[]> = { CRITICAL: [], MAJOR: [], MINOR: [] };
    for (const a of assumptions) {
      if (a.impact in groups) {
        groups[a.impact].push(a);
      }
    }
    return groups;
  }, [assumptions]);

  const availableAudiences = useMemo(() => {
    return AUDIENCE_OPTIONS.filter((opt) => resolveAudience(data, opt.key) !== null);
  }, [data]);

  return (
    <SummarySection>
      {/* Grey meta bar with audience buttons inline */}
      <MetaInfo>
        <div>
          <span>Name:</span> {data.name}
        </div>
        <div>
          <span>LLM:</span> {data["evi:llmModel"]}
        </div>
        <div>
          <span>Date:</span> {data.dateCreated}
        </div>
        <div>
          <span>Entities:</span> {Object.keys(data["@graph"]).length}
        </div>
        {data["evi:stepAnnotations"] && (
          <div>
            <span>Annotations:</span> {data["evi:stepAnnotations"].length}
          </div>
        )}
        {availableAudiences.length > 1 && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#999", marginRight: 2 }}>Audience:</span>
            {availableAudiences.map((opt) => (
              <AudienceButton
                key={opt.key}
                $active={selectedAudience === opt.key}
                onClick={() => setSelectedAudience(opt.key)}
              >
                {opt.label}
              </AudienceButton>
            ))}
          </div>
        )}
      </MetaInfo>

      {/* 0. Overview — brief orientation card */}
      {data["evi:overview"] && (
        <CollapsibleCard title="Overview" defaultOpen={true}>
          <OverviewContent>
            <div className="overview-description">
              {data["evi:overview"].pipelineDescription || data["evi:overview"].dataDescription}
            </div>

            {data["evi:overview"].pipelineSteps && data["evi:overview"].pipelineSteps.length > 0 && (
              <div className="overview-row">
                <span className="overview-label">Pipeline</span>
                <PipelineStepsContainer>
                  <ul>
                    {data["evi:overview"].pipelineSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </PipelineStepsContainer>
              </div>
            )}

            {data["evi:overview"].dataFormats.length > 0 && (
              <div className="overview-row">
                <span className="overview-label">Formats</span>
                <div className="overview-tags">
                  {data["evi:overview"].dataFormats.map((fmt) => (
                    <span key={fmt} className="overview-tag">{fmt}</span>
                  ))}
                </div>
              </div>
            )}

            {data["evi:overview"].keywords.length > 0 && (
              <div className="overview-row">
                <span className="overview-label">Keywords</span>
                <div className="overview-tags">
                  {data["evi:overview"].keywords.map((kw) => (
                    <span key={kw} className="overview-tag">{kw}</span>
                  ))}
                </div>
              </div>
            )}

            {data["evi:overview"].license && (
              <div className="overview-row">
                <span className="overview-label">License</span>
                <span>
                  {data["evi:overview"].license.startsWith("http") ? (
                    <a
                      className="overview-license-link"
                      href={data["evi:overview"].license}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {data["evi:overview"].license}
                    </a>
                  ) : (
                    data["evi:overview"].license
                  )}
                </span>
              </div>
            )}

            {data["evi:overview"].conditionsOfAccess && (
              <div className="overview-row">
                <span className="overview-label">Access</span>
                <span>{data["evi:overview"].conditionsOfAccess}</span>
              </div>
            )}

            {data["evi:overview"].topAssumptions.length > 0 && (
              <div className="overview-row">
                <span className="overview-label">Key Assumptions</span>
                <div>
                  {data["evi:overview"].topAssumptions.map((a, i) => (
                    <div key={i} className="overview-assumption">
                      <span
                        className={`assumption-level-badge badge-${a.impact === "CRITICAL" ? "critical" : a.impact === "MAJOR" ? "major" : "minor"}`}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "1px 5px",
                          borderRadius: 3,
                          color: "#fff",
                          background: a.impact === "CRITICAL" ? "#7b2d8e" : a.impact === "MAJOR" ? "#d68910" : "#1a5276",
                        }}
                      >
                        {a.impact.slice(0, 5)}
                      </span>
                      <span>{a.name || a.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </OverviewContent>
        </CollapsibleCard>
      )}

      {/* 1. Evidence Graph — open by default, no padding so ReactFlow gets full space */}
      <GraphCard title="Evidence Graph" defaultOpen={true}>
        {graphElement}
      </GraphCard>

      {/* 2. Assumptions — open to CRITICAL by default */}
      {assumptions.length > 0 && (
        <CollapsibleCard
          title={`Assumptions (${assumptions.length})`}
        >
          <AssumptionsList>
            {IMPACT_ORDER.map((impact) => {
              const group = groupedAssumptions[impact];
              if (!group.length) return null;
              const isGroupExpanded = expandedGroups.has(impact);
              return (
                <React.Fragment key={impact}>
                  <ImpactGroupHeader
                    $color={IMPACT_COLORS[impact]}
                    onClick={() => toggleGroup(impact)}
                  >
                    <span className="group-toggle">{isGroupExpanded ? "\u25BC" : "\u25B6"}</span>
                    <span className="group-label">{impact}</span>
                    <span className="group-count">({group.length})</span>
                  </ImpactGroupHeader>
                  {isGroupExpanded && group.map((a, i) => (
                    <AssumptionItem
                      key={i}
                      assumption={a}
                      sourceLabel={getSourceLabel(a, data)}
                      onHighlightNode={onHighlightNode}
                      data={data}
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </AssumptionsList>
        </CollapsibleCard>
      )}

    </SummarySection>
  );
};

export default AnnotatedSummaryCards;
