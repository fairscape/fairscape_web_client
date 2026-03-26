import React, { useState, useMemo } from "react";
import styled from "styled-components";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import { GraphDataService } from "./GraphDataService";
import { getEntityType } from "./graphUtils";
import {
  AnnotationData,
  Assumption,
  Concern,
  normalizeImpact,
  AssumptionImpact,
} from "../../types/graph";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LevelAssumption {
  impact: AssumptionImpact;
  name?: string;
  description: string;
  downstreamImpacts?: string;
  evidenceArtifactId?: string;
  evidenceLocation?: string;
}

interface LevelNode {
  levelLabel: string;
  computationName: string;
  assumptions: LevelAssumption[];
  counts: Record<AssumptionImpact, number>;
  totalCount: number;
  children: LevelNode[];
  depth: number;
}

function computeMaxDepth(nodes: LevelNode[]): number {
  if (nodes.length === 0) return 0;
  return Math.max(...nodes.map((n) => Math.max(n.depth, computeMaxDepth(n.children))));
}

// ---------------------------------------------------------------------------
// Traversal Helpers (unchanged)
// ---------------------------------------------------------------------------

function normalizeRefs(
  refs: { "@id": string } | Array<{ "@id": string }> | undefined
): Array<{ "@id": string }> {
  if (!refs) return [];
  return Array.isArray(refs) ? refs : [refs];
}

function getAssumptions(
  annotation: AnnotationData
): Array<{ impact: AssumptionImpact; name?: string; description: string; downstreamImpacts?: string; evidence?: { artifact: { "@id": string }; location?: string } }> {
  if (annotation["evi:assumptions"] && annotation["evi:assumptions"].length > 0) {
    return annotation["evi:assumptions"].map((a) => ({
      ...a,
      impact: normalizeImpact(a.impact),
    }));
  }
  if (annotation["evi:concerns"] && annotation["evi:concerns"].length > 0) {
    return annotation["evi:concerns"].map((c: Concern) => ({
      impact: normalizeImpact(c.level),
      description: c.description,
    }));
  }
  return [];
}

function getCodeAssumptionsFromCA(
  ca: { assumptions?: Assumption[]; concerns?: Concern[] }
): Array<{ impact: AssumptionImpact; name?: string; description: string; downstreamImpacts?: string; evidence?: { artifact: { "@id": string }; location?: string } }> {
  if (ca.assumptions && ca.assumptions.length > 0) {
    return ca.assumptions.map((a) => ({ ...a, impact: normalizeImpact(a.impact) }));
  }
  if (ca.concerns && ca.concerns.length > 0) {
    return ca.concerns.map((c: Concern) => ({
      impact: normalizeImpact(c.level),
      description: c.description,
    }));
  }
  return [];
}

// ---------------------------------------------------------------------------
// Build Level Hierarchy
// ---------------------------------------------------------------------------

export function buildLevelHierarchy(
  datasetId: string,
  dataService: GraphDataService
): LevelNode[] {
  const visited = new Set<string>();

  function processDataset(dsId: string, depth: number): LevelNode[] {
    const entity = dataService.getNode(dsId);
    if (!entity) return [];

    const entityType = getEntityType(entity["@type"]);
    if (
      entityType !== "Dataset" &&
      entityType !== "Sample" &&
      entityType !== "DatasetCollection" &&
      entityType !== "DatasetGroup"
    ) {
      return [];
    }

    const generatedByRefs = normalizeRefs(entity.generatedBy);
    const levelNodes: LevelNode[] = [];

    for (const compRef of generatedByRefs) {
      const compId = compRef["@id"];
      if (visited.has(compId)) continue;
      visited.add(compId);

      const comp = dataService.getNode(compId);
      if (!comp) continue;

      // Gather all assumptions (step-level + code-analysis)
      const assumptions: LevelAssumption[] = [];
      const annotation = dataService.getAnnotationFor(compId);

      if (annotation) {
        for (const a of getAssumptions(annotation)) {
          assumptions.push({
            impact: a.impact,
            name: a.name,
            description: a.description,
            downstreamImpacts: a.downstreamImpacts,
            evidenceArtifactId: a.evidence?.artifact?.["@id"],
            evidenceLocation: a.evidence?.location,
          });
        }

        const codeAnalysisList = annotation["evi:codeAnalysis"] || [];
        for (const ca of codeAnalysisList) {
          for (const a of getCodeAssumptionsFromCA(ca)) {
            assumptions.push({
              impact: a.impact,
              name: a.name,
              description: a.description,
              downstreamImpacts: a.downstreamImpacts,
              evidenceArtifactId: a.evidence?.artifact?.["@id"],
              evidenceLocation: a.evidence?.location,
            });
          }
        }
      }

      // Compute counts
      const counts: Record<AssumptionImpact, number> = { CRITICAL: 0, MAJOR: 0, MINOR: 0 };
      for (const a of assumptions) {
        counts[a.impact]++;
      }

      // Recurse into usedDataset
      const children: LevelNode[] = [];
      const usedDatasetRefs = normalizeRefs(comp.usedDataset);
      for (const dsRef of usedDatasetRefs) {
        children.push(...processDataset(dsRef["@id"], depth + 1));
      }

      levelNodes.push({
        levelLabel: "", // assigned below
        computationName: comp.name || comp.label || compId,
        assumptions,
        counts,
        totalCount: assumptions.length,
        children,
        depth,
      });
    }

    // Assign level labels
    for (let i = 0; i < levelNodes.length; i++) {
      const letter = levelNodes.length > 1 ? String.fromCharCode(65 + i) : "";
      levelNodes[i].levelLabel = `Level ${depth}${letter}`;
    }

    return levelNodes;
  }

  return processDataset(datasetId, 1);
}

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const IMPACT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  CRITICAL: { bg: "#f3e8f9", border: "#7b2d8e", text: "#7b2d8e" },
  MAJOR: { bg: "#fef9e7", border: "#d68910", text: "#d68910" },
  MINOR: { bg: "#eaf4fb", border: "#1a5276", text: "#1a5276" },
};

const ChainModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 24px;
`;

const ChainModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  font-family: sans-serif;
  overflow: hidden;
`;

const ChainModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e9ecef;
  flex-shrink: 0;

  h2 {
    margin: 0;
    font-size: 18px;
    color: #2c3e50;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    &:hover { color: #000; }
  }
`;

const EmptyMessage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 15px;
  padding: 60px;
`;

const TreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
`;

const DepthRowWrapper = styled.div<{ $depth: number; $maxDepth: number }>`
  width: ${(p) => Math.min(100, 40 + (p.$depth / Math.max(p.$maxDepth, 1)) * 60)}%;
  margin: 6px auto;
  display: flex;
  gap: 8px;
`;

const LevelRowWrapper = styled.div<{ $siblingCount: number }>`
  flex: 1;
  min-width: 0;
`;

const SummaryBar = styled.div<{ $depth: number; $hasAssumptions: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: ${(p) => 10 + p.$depth}px ${(p) => 12 + p.$depth * 2}px;
  background: hsl(220, ${(p) => 30 + p.$depth * 12}%, ${(p) => 92 - p.$depth * 12}%);
  border-left: ${(p) => 2 + p.$depth * 2}px solid hsl(220, 70%, ${(p) => 60 - p.$depth * 10}%);
  border-radius: 6px;
  box-shadow: 0 ${(p) => p.$depth * 2}px ${(p) => p.$depth * 5}px rgba(0, 0, 0, ${(p) => 0.04 + p.$depth * 0.04});
  cursor: ${(p) => (p.$hasAssumptions ? "pointer" : "default")};
  user-select: none;
  transition: all 0.15s;
  &:hover {
    filter: ${(p) => (p.$hasAssumptions ? "brightness(0.96)" : "none")};
  }
`;

const Chevron = styled.span<{ $expanded: boolean; $depth: number }>`
  display: inline-block;
  transition: transform 0.2s;
  transform: rotate(${(p) => (p.$expanded ? "90deg" : "0deg")});
  font-size: 12px;
  color: ${(p) => (p.$depth >= 3 ? "rgba(255,255,255,0.7)" : "#666")};
  width: 16px;
  flex-shrink: 0;
`;

const LevelLabel = styled.span<{ $depth: number }>`
  font-weight: ${(p) => Math.min(700, 500 + p.$depth * 50)};
  font-size: ${(p) => 13 + p.$depth * 0.5}px;
  color: ${(p) => (p.$depth >= 3 ? "rgba(255,255,255,0.95)" : `hsl(220, 30%, ${Math.max(15, 35 - p.$depth * 8)}%)`)};
`;

const SupportsBadge = styled.span<{ $depth: number }>`
  font-size: 10px;
  color: ${(p) => (p.$depth >= 3 ? "rgba(255,255,255,0.6)" : "rgba(0, 0, 0, 0.4)")};
  font-style: italic;
  white-space: nowrap;
`;

const ComputationContext = styled.span<{ $depth: number }>`
  font-size: 12px;
  color: ${(p) => (p.$depth >= 3 ? "rgba(255,255,255,0.7)" : "#888")};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
`;

const CountBadge = styled.span<{ $color: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
`;

const AssumptionList = styled.div`
  margin-top: 6px;
  margin-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 8px;
`;

const AssumptionItem = styled.div<{ $borderColor: string; $bg: string }>`
  background: ${(p) => p.$bg};
  border-left: 4px solid ${(p) => p.$borderColor};
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.4;
  position: relative;
`;

const ImpactBadge = styled.span<{ $color: string; $bg: string }>`
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  margin-bottom: 3px;
`;

const AssumptionInfoBtn = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #aaa;
  background: #fff;
  color: #666;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    background: #2c3e50;
    color: #fff;
    border-color: #2c3e50;
  }
`;

const AssumptionTooltipContent = styled.div`
  max-width: 350px;
  font-size: 12px;
  line-height: 1.5;
  padding: 6px;

  .tooltip-impact { font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .tooltip-name { font-weight: 600; margin-bottom: 4px; color: #2c3e50; }
  .tooltip-desc { color: #555; margin-bottom: 6px; }
  .tooltip-downstream {
    background: #fff8e1;
    border-left: 3px solid #ffb300;
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 11px;
    margin-bottom: 4px;
  }
  .tooltip-downstream-label { font-weight: 600; font-size: 10px; text-transform: uppercase; color: #666; }
  .tooltip-evidence { font-size: 11px; color: #888; }
  .tooltip-evidence a { color: #007bff; text-decoration: none; &:hover { text-decoration: underline; } }
`;

// ---------------------------------------------------------------------------
// Flatten tree into depth-grouped rows so siblings (A, B, C) sit side-by-side
// and all rows render at the same DOM level for correct percentage widths
// ---------------------------------------------------------------------------

interface FlatRow {
  siblings: LevelNode[];
  depth: number;
}

function flattenToRows(nodes: LevelNode[], depth: number = 1): FlatRow[] {
  if (nodes.length === 0) return [];
  const result: FlatRow[] = [{ siblings: nodes, depth }];
  // Collect all children from all siblings at this depth into the next depth
  const allChildren: LevelNode[] = [];
  for (const node of nodes) {
    allChildren.push(...node.children);
  }
  result.push(...flattenToRows(allChildren, depth + 1));
  return result;
}

// ---------------------------------------------------------------------------
// Single Level Row Component (no nesting — all rendered flat in TreeContainer)
// ---------------------------------------------------------------------------

const LevelNodeRow: React.FC<{ node: LevelNode; depth: number; siblingCount: number }> = ({ node, depth, siblingCount }) => {
  const [expanded, setExpanded] = useState(false);
  const hasAssumptions = node.totalCount > 0;

  return (
    <LevelRowWrapper $siblingCount={siblingCount}>
      <SummaryBar
        $depth={depth}
        $hasAssumptions={hasAssumptions}
        onClick={() => hasAssumptions && setExpanded(!expanded)}
      >
        {hasAssumptions ? (
          <Chevron $expanded={expanded} $depth={depth}>&#9654;</Chevron>
        ) : (
          <span style={{ width: 16, textAlign: "center", color: depth >= 3 ? "rgba(255,255,255,0.5)" : "#bbb", fontSize: 10, flexShrink: 0 }}>&#9675;</span>
        )}
        <LevelLabel $depth={depth}>{node.levelLabel}</LevelLabel>
        <ComputationContext $depth={depth}>{node.computationName}</ComputationContext>
        <SupportsBadge $depth={depth}>
          {depth === 1 ? "Top level" : `Supports ${depth - 1} level${depth > 2 ? "s" : ""} above`}
        </SupportsBadge>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {(["CRITICAL", "MAJOR", "MINOR"] as AssumptionImpact[]).map((impact) => {
            const count = node.counts[impact];
            if (count === 0) return null;
            const colors = IMPACT_COLORS[impact];
            return (
              <CountBadge key={impact} $color={colors.text} $bg={colors.bg}>
                {count} {impact.charAt(0) + impact.slice(1).toLowerCase()}
              </CountBadge>
            );
          })}
        </div>
      </SummaryBar>

      {expanded && (
        <AssumptionList>
          {node.assumptions.map((a, i) => {
            const colors = IMPACT_COLORS[a.impact];
            const tooltipContent = (
              <AssumptionTooltipContent>
                <div className="tooltip-impact" style={{ color: colors.text }}>{a.impact}</div>
                {a.name && <div className="tooltip-name">{a.name}</div>}
                <div className="tooltip-desc">{a.description}</div>
                {a.downstreamImpacts && (
                  <div className="tooltip-downstream">
                    <div className="tooltip-downstream-label">If Wrong</div>
                    {a.downstreamImpacts}
                  </div>
                )}
                {a.evidenceArtifactId && (
                  <div className="tooltip-evidence">
                    Evidence:{" "}
                    <a href={`/view/${a.evidenceArtifactId}`} target="_blank" rel="noopener noreferrer">
                      {a.evidenceArtifactId}
                    </a>
                    {a.evidenceLocation && <span> ({a.evidenceLocation})</span>}
                  </div>
                )}
              </AssumptionTooltipContent>
            );

            return (
              <AssumptionItem key={i} $borderColor={colors.border} $bg={colors.bg}>
                <ImpactBadge $color={colors.text} $bg="transparent">{a.impact}</ImpactBadge>
                <div style={{ paddingRight: 24 }}>
                  {a.name && <div style={{ fontWeight: 600, marginBottom: 2 }}>{a.name}</div>}
                  <div style={{ color: "#555" }}>
                    {a.description.length > 120 ? a.description.slice(0, 120) + "..." : a.description}
                  </div>
                </div>
                <Tippy content={tooltipContent} theme="light" interactive trigger="click" placement="right" appendTo={() => document.body} maxWidth={400}>
                  <AssumptionInfoBtn onClick={(e) => e.stopPropagation()}>i</AssumptionInfoBtn>
                </Tippy>
              </AssumptionItem>
            );
          })}
        </AssumptionList>
      )}
    </LevelRowWrapper>
  );
};

// ---------------------------------------------------------------------------
// Modal Component
// ---------------------------------------------------------------------------

interface AssumptionChainModalProps {
  datasetId: string;
  datasetName: string;
  dataService: GraphDataService;
  onClose: () => void;
}

const AssumptionChainModal: React.FC<AssumptionChainModalProps> = ({
  datasetId,
  datasetName,
  dataService,
  onClose,
}) => {
  const levels = useMemo(
    () => buildLevelHierarchy(datasetId, dataService),
    [datasetId, dataService]
  );

  const maxDepth = useMemo(() => computeMaxDepth(levels), [levels]);
  const rows = useMemo(() => flattenToRows(levels), [levels]);
  const hasChain = rows.length > 0;

  return (
    <ChainModalOverlay onClick={onClose}>
      <ChainModalContent onClick={(e) => e.stopPropagation()}>
        <ChainModalHeader>
          <h2>Assumption Chain: {datasetName}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </ChainModalHeader>

        {hasChain ? (
          <TreeContainer>
            {rows.map((row, i) => (
              <DepthRowWrapper key={`row-${row.depth}-${i}`} $depth={row.depth} $maxDepth={maxDepth}>
                {row.siblings.map((node, j) => (
                  <LevelNodeRow key={`${node.levelLabel}-${j}`} node={node} depth={row.depth} siblingCount={row.siblings.length} />
                ))}
              </DepthRowWrapper>
            ))}
          </TreeContainer>
        ) : (
          <EmptyMessage>
            No provenance chain available for this dataset.
          </EmptyMessage>
        )}
      </ChainModalContent>
    </ChainModalOverlay>
  );
};

export default AssumptionChainModal;
