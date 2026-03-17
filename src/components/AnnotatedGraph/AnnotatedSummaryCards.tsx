import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { AnnotatedEvidenceGraphData, GraphConcern, ConcernLevel } from "../../types/graph";

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

const ConcernsList = styled.div`
  .concern-item {
    padding: 8px 12px;
    margin: 4px 0;
    border-radius: 4px;
    font-size: 13px;
    line-height: 1.5;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .concern-clickable {
    cursor: pointer;
    &:hover {
      filter: brightness(0.95);
    }
  }
  .concern-critical {
    background: #fde8e8;
    border-left: 4px solid #c0392b;
  }
  .concern-moderate {
    background: #fef9e7;
    border-left: 4px solid #d68910;
  }
  .concern-minor {
    background: #eaf4fb;
    border-left: 4px solid #1a5276;
  }
  .concern-level-badge {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: 3px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .badge-critical { background: #c0392b; color: #fff; }
  .badge-moderate { background: #d68910; color: #fff; }
  .badge-minor { background: #1a5276; color: #fff; }
  .concern-source {
    margin-left: auto;
    flex-shrink: 0;
    font-size: 11px;
    color: #888;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .concern-clickable .concern-source {
    color: #555;
  }
  .concern-clickable:hover .concern-source {
    color: #2c3e50;
  }
  .concern-source-icon {
    font-size: 13px;
  }
`;

const LevelFilterBar = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  align-items: center;
`;

const LevelFilterButton = styled.button<{ $active: boolean; $color: string }>`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(props) => props.$color};
  background: ${(props) => (props.$active ? props.$color : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : props.$color)};
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
`;

const ConcernGroupHeader = styled.h4`
  margin: 16px 0 6px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:first-child {
    margin-top: 0;
  }
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
  gap: 24px;
  flex-wrap: wrap;
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

function getConcernCssClass(concern: GraphConcern): string {
  switch (concern.level) {
    case "CRITICAL": return "critical";
    case "MODERATE": return "moderate";
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

interface AnnotatedSummaryCardsProps {
  data: AnnotatedEvidenceGraphData;
  placement: "above" | "below";
  onHighlightNode?: (nodeId: string) => void;
}

const LEVEL_ORDER: ConcernLevel[] = ["CRITICAL", "MODERATE", "MINOR"];
const LEVEL_COLORS: Record<ConcernLevel, string> = {
  CRITICAL: "#c0392b",
  MODERATE: "#d68910",
  MINOR: "#1a5276",
};

function getSourceLabel(
  concern: GraphConcern,
  data: AnnotatedEvidenceGraphData,
): string {
  const sourceId = concern.sourceAnnotation?.["@id"];
  if (!sourceId) return "";
  // If it points to the RO-Crate root, it's a pipeline-wide concern
  const rocrateId = data["evi:annotates"]?.["@id"];
  if (sourceId === rocrateId) return "Full Pipeline";
  // Look up the annotation in the graph to find what it annotates
  const graph = data["@graph"] || {};
  const annotationEntity = graph[sourceId];
  if (annotationEntity) {
    // Try to get the name of the computation it annotates
    const annotatesId = annotationEntity["evi:annotates"]?.["@id"];
    if (annotatesId && graph[annotatesId]) {
      return graph[annotatesId].name || annotatesId;
    }
    return annotationEntity.name || sourceId;
  }
  return sourceId;
}

const AnnotatedSummaryCards: React.FC<AnnotatedSummaryCardsProps> = ({
  data,
  placement,
  onHighlightNode,
}) => {
  const [visibleLevels, setVisibleLevels] = useState<Set<ConcernLevel>>(
    () => new Set(["CRITICAL"])
  );

  const toggleLevel = (level: ConcernLevel) => {
    setVisibleLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  };

  const concerns = data["evi:concerns"] || [];

  const levelCounts = useMemo(() => {
    const counts: Record<ConcernLevel, number> = { CRITICAL: 0, MODERATE: 0, MINOR: 0 };
    for (const c of concerns) {
      if (c.level in counts) counts[c.level]++;
    }
    return counts;
  }, [concerns]);

  const groupedConcerns = useMemo(() => {
    const groups: Record<ConcernLevel, GraphConcern[]> = { CRITICAL: [], MODERATE: [], MINOR: [] };
    for (const c of concerns) {
      if (visibleLevels.has(c.level) && c.level in groups) {
        groups[c.level].push(c);
      }
    }
    return groups;
  }, [concerns, visibleLevels]);

  if (placement === "above") {
    return (
      <SummarySection>
        {/* Meta info bar */}
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
        </MetaInfo>

        {/* Executive Summary - always open */}
        <CollapsibleCard title="Executive Summary" defaultOpen={true}>
          <p>{data["evi:executiveSummary"]}</p>
        </CollapsibleCard>
      </SummarySection>
    );
  }

  // placement === "below"
  return (
    <SummarySection>
      <CollapsibleCard title="Narrative Summary">
        <p>{data["evi:narrativeSummary"]}</p>
      </CollapsibleCard>

      {data["evi:keyFindings"] && data["evi:keyFindings"].length > 0 && (
        <CollapsibleCard
          title={`Key Findings (${data["evi:keyFindings"].length})`}
        >
          <FindingsList>
            {data["evi:keyFindings"].map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </FindingsList>
        </CollapsibleCard>
      )}

      {concerns.length > 0 && (
        <CollapsibleCard
          title={`Concerns (${concerns.length})`}
          defaultOpen={true}
        >
          <LevelFilterBar>
            {LEVEL_ORDER.map((level) => (
              <LevelFilterButton
                key={level}
                $active={visibleLevels.has(level)}
                $color={LEVEL_COLORS[level]}
                onClick={() => toggleLevel(level)}
              >
                {level} ({levelCounts[level]})
              </LevelFilterButton>
            ))}
          </LevelFilterBar>
          <ConcernsList>
            {LEVEL_ORDER.map((level) => {
              const group = groupedConcerns[level];
              if (!group.length) return null;
              return (
                <React.Fragment key={level}>
                  <ConcernGroupHeader>{level} ({group.length})</ConcernGroupHeader>
                  {group.map((c, i) => {
                    const cssClass = getConcernCssClass(c);
                    const sourceLabel = getSourceLabel(c, data);
                    const rocrateId = data["evi:annotates"]?.["@id"];
                    const sourceId = c.sourceAnnotation?.["@id"];
                    const isPipelineWide = sourceId === rocrateId;
                    const isClickable = !!onHighlightNode && !!sourceId && !isPipelineWide;
                    return (
                      <div
                        key={i}
                        className={`concern-item concern-${cssClass}${isClickable ? " concern-clickable" : ""}`}
                        onClick={isClickable ? () => onHighlightNode!(sourceId) : undefined}
                        title={isClickable ? `Click to highlight: ${sourceLabel}` : undefined}
                      >
                        <span>{c.description}</span>
                        <span className="concern-source">
                          {sourceLabel}
                          {isClickable && <span className="concern-source-icon">&rarr;</span>}
                        </span>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </ConcernsList>
        </CollapsibleCard>
      )}
    </SummarySection>
  );
};

export default AnnotatedSummaryCards;
