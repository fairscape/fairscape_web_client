import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import {
  AnnotatedEvidenceGraphData,
  GraphAssumption,
  AssumptionImpact,
  AudiencePerspective,
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

const MarkdownWrapper = styled.div`
  font-size: 14px;
  line-height: 1.6;

  p { margin: 0 0 8px; }
  p:last-child { margin-bottom: 0; }
  h1, h2, h3, h4, h5, h6 {
    margin: 12px 0 6px;
    color: #2c3e50;
  }
  h1 { font-size: 18px; }
  h2 { font-size: 16px; }
  h3 { font-size: 15px; }
  ul, ol { margin: 4px 0; padding-left: 20px; }
  li { margin: 2px 0; }
  strong { color: #2c3e50; }
  code {
    background: #f1f3f5;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 0.9em;
  }
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

const FindingsList = styled.ul`
  margin: 0;
  padding: 0 0 0 20px;
  li {
    margin: 6px 0;
  }
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

  return (
    <div className={`assumption-item assumption-${cssClass}`}>
      <AssumptionRow onClick={() => setExpanded(!expanded)}>
        <AssumptionChevron>{expanded ? "\u25BC" : "\u25B6"}</AssumptionChevron>
        <span className={`assumption-level-badge badge-${cssClass}`}>
          {assumption.impact.slice(0, 5)}
        </span>
        <AssumptionName>{displayName}</AssumptionName>
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
  executiveSummary: string;
  narrativeSummary: string;
  keyFindings: string[];
  assumptions: GraphAssumption[];
}

function resolveAudience(
  data: AnnotatedEvidenceGraphData,
  audienceKey: string,
): ResolvedPerspective | null {
  if (audienceKey === "datasci") {
    return {
      executiveSummary: data["evi:executiveSummary"],
      narrativeSummary: data["evi:narrativeSummary"],
      keyFindings: data["evi:keyFindings"] || [],
      assumptions: getAssumptions(data),
    };
  }
  const audiences = data["evi:audiences"] || [];
  const match = audiences.find((a) => a.targetAudience === audienceKey);
  if (!match) return null;
  return {
    executiveSummary: match.executiveSummary,
    narrativeSummary: match.narrativeSummary,
    keyFindings: match.keyFindings || [],
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

      {/* 1. Evidence Graph — open by default, no padding so ReactFlow gets full space */}
      <GraphCard title="Evidence Graph" defaultOpen={true}>
        {graphElement}
      </GraphCard>

      {/* 2. Executive Summary */}
      <CollapsibleCard title="Executive Summary">
        {perspective ? (
          <MarkdownWrapper>
            <ReactMarkdown>{perspective.executiveSummary}</ReactMarkdown>
          </MarkdownWrapper>
        ) : (
          <p style={{ color: "#999", fontStyle: "italic" }}>
            Not available for this perspective.
          </p>
        )}
      </CollapsibleCard>

      {/* 3. Assumptions — open to CRITICAL by default */}
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

      {/* 4. Narrative Summary */}
      {perspective && (
        <CollapsibleCard title="Narrative Summary">
          <MarkdownWrapper>
            <ReactMarkdown>{perspective.narrativeSummary}</ReactMarkdown>
          </MarkdownWrapper>
        </CollapsibleCard>
      )}

      {/* 5. Key Findings */}
      {perspective && perspective.keyFindings.length > 0 && (
        <CollapsibleCard
          title={`Key Findings (${perspective.keyFindings.length})`}
        >
          <FindingsList>
            {perspective.keyFindings.map((f, i) => (
              <li key={i}>
                <MarkdownWrapper>
                  <ReactMarkdown>{f}</ReactMarkdown>
                </MarkdownWrapper>
              </li>
            ))}
          </FindingsList>
        </CollapsibleCard>
      )}
    </SummarySection>
  );
};

export default AnnotatedSummaryCards;
