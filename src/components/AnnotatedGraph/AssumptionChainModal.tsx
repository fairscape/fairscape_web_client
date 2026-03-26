import React, { useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge,
  Handle,
  Position,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

import { GraphDataService } from "./GraphDataService";
import { getEntityType, abbreviateName } from "./graphUtils";
import { getLayoutedElements } from "../EvidenceGraph/utils/layoutUtils";
import {
  RawGraphEntity,
  AnnotationData,
  Assumption,
  Concern,
  normalizeImpact,
  AssumptionImpact,
} from "../../types/graph";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChainNodeData {
  chainType: "dataset" | "computation" | "software" | "assumption" | "assumptionGroupBg";
  label: string;
  description?: string;
  impact?: AssumptionImpact;
  assumptionName?: string;
  assumptionDescription?: string;
  downstreamImpacts?: string;
  evidenceArtifactId?: string;
  evidenceLocation?: string;
  assumptionCount?: number;
  noAnnotation?: boolean;
  // For group background nodes:
  groupWidth?: number;
  groupHeight?: number;
  // Track which parent an assumption belongs to (for grouping)
  assumptionParentId?: string;
}

// ---------------------------------------------------------------------------
// Traversal Algorithm
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

export function buildAssumptionChain(
  datasetId: string,
  dataService: GraphDataService
): { nodes: Node<ChainNodeData>[]; edges: Edge[] } {
  const visited = new Set<string>();
  const chainNodes: Node<ChainNodeData>[] = [];
  const chainEdges: Edge[] = [];
  let edgeCounter = 0;

  function addNode(id: string, data: ChainNodeData) {
    chainNodes.push({
      id,
      type: "assumptionChainNode",
      position: { x: 0, y: 0 },
      data,
    });
  }

  function addEdge(source: string, target: string, label: string) {
    chainEdges.push({
      id: `chain-edge-${edgeCounter++}`,
      source,
      target,
      type: "smoothstep",
      label,
      style: { strokeWidth: 1.5, stroke: "#999" },
      labelStyle: { fontSize: 10, fill: "#888" },
    });
  }

  function addAssumptionNodes(
    parentId: string,
    assumptions: Array<{ impact: AssumptionImpact; name?: string; description: string; downstreamImpacts?: string; evidence?: { artifact: { "@id": string }; location?: string } }>,
    prefix: string
  ) {
    assumptions.forEach((a, i) => {
      const aId = `${prefix}-assumption-${i}`;
      addNode(aId, {
        chainType: "assumption",
        label: a.name || (a.description.length > 60 ? a.description.slice(0, 60) + "..." : a.description),
        impact: a.impact,
        assumptionName: a.name,
        assumptionDescription: a.description,
        downstreamImpacts: a.downstreamImpacts,
        evidenceArtifactId: a.evidence?.artifact?.["@id"],
        evidenceLocation: a.evidence?.location,
        assumptionParentId: parentId,
      });
      addEdge(parentId, aId, "assumes");
    });
  }

  function traverse(entityId: string) {
    if (visited.has(entityId)) return;
    visited.add(entityId);

    const entity = dataService.getNode(entityId);
    if (!entity) return;

    const entityType = getEntityType(entity["@type"]);

    if (entityType === "Dataset" || entityType === "Sample" || entityType === "DatasetCollection" || entityType === "DatasetGroup") {
      addNode(entityId, {
        chainType: "dataset",
        label: abbreviateName(entity.name || entity.label || entityId, 40),
        description: entity.description,
      });

      const generatedByRefs = normalizeRefs(entity.generatedBy);
      for (const compRef of generatedByRefs) {
        const compId = compRef["@id"];
        if (visited.has(compId)) {
          addEdge(entityId, compId, "generated by");
          continue;
        }
        visited.add(compId);

        const comp = dataService.getNode(compId);
        if (!comp) continue;

        const annotation = dataService.getAnnotationFor(compId);
        const stepAssumptions = annotation ? getAssumptions(annotation) : [];
        const codeAnalysisList = annotation?.["evi:codeAnalysis"] || [];

        let totalAssumptions = stepAssumptions.length;
        for (const ca of codeAnalysisList) {
          totalAssumptions += getCodeAssumptionsFromCA(ca).length;
        }

        addNode(compId, {
          chainType: "computation",
          label: abbreviateName(comp.name || comp.label || compId, 40),
          description: comp.description,
          assumptionCount: totalAssumptions,
          noAnnotation: !annotation,
        });
        addEdge(entityId, compId, "generated by");

        if (annotation) {
          addAssumptionNodes(compId, stepAssumptions, compId + "-step");

          const coveredSoftwareIds = new Set<string>();
          for (const ca of codeAnalysisList) {
            const swId = ca.software["@id"];
            coveredSoftwareIds.add(swId);

            if (!visited.has(swId)) {
              visited.add(swId);
              const swEntity = dataService.getNode(swId);
              addNode(swId, {
                chainType: "software",
                label: abbreviateName(ca.name || swEntity?.name || swId, 40),
                description: ca.summary,
              });
            }
            addEdge(compId, swId, "used software");

            const swAssumptions = getCodeAssumptionsFromCA(ca);
            addAssumptionNodes(swId, swAssumptions, swId + "-code");
          }

          const usedSoftwareRefs = normalizeRefs(comp.usedSoftware);
          for (const swRef of usedSoftwareRefs) {
            if (coveredSoftwareIds.has(swRef["@id"])) continue;
            if (!visited.has(swRef["@id"])) {
              visited.add(swRef["@id"]);
              const swEntity = dataService.getNode(swRef["@id"]);
              if (swEntity) {
                addNode(swRef["@id"], {
                  chainType: "software",
                  label: abbreviateName(swEntity.name || swEntity.label || swRef["@id"], 40),
                  description: swEntity.description,
                });
              }
            }
            addEdge(compId, swRef["@id"], "used software");
          }
        }

        const usedDatasetRefs = normalizeRefs(comp.usedDataset);
        for (const dsRef of usedDatasetRefs) {
          if (!visited.has(dsRef["@id"])) {
            traverse(dsRef["@id"]);
          }
          addEdge(compId, dsRef["@id"], "used");
        }
      }
    }
  }

  traverse(datasetId);
  return { nodes: chainNodes, edges: chainEdges };
}

// ---------------------------------------------------------------------------
// Post-layout: add colored background rectangles behind assumption clusters
// ---------------------------------------------------------------------------

const GROUP_PADDING = 16;

function addAssumptionGroupBackgrounds(
  nodes: Node<ChainNodeData>[],
  edges: Edge[]
): { nodes: Node<ChainNodeData>[]; edges: Edge[] } {
  // Group assumption nodes by their parent
  const groups = new Map<string, Node<ChainNodeData>[]>();
  for (const node of nodes) {
    const parentId = node.data.assumptionParentId;
    if (node.data.chainType === "assumption" && parentId) {
      if (!groups.has(parentId)) groups.set(parentId, []);
      groups.get(parentId)!.push(node);
    }
  }

  const bgNodes: Node<ChainNodeData>[] = [];
  for (const [parentId, assumptionNodes] of groups) {
    if (assumptionNodes.length === 0) continue;

    // Compute bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of assumptionNodes) {
      const x = n.position.x;
      const y = n.position.y;
      const w = (n.width || 200);
      const h = (n.height || 90);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    }

    const groupWidth = maxX - minX + GROUP_PADDING * 2;
    const groupHeight = maxY - minY + GROUP_PADDING * 2;

    bgNodes.push({
      id: `group-bg-${parentId}`,
      type: "assumptionGroupBg",
      position: { x: minX - GROUP_PADDING, y: minY - GROUP_PADDING },
      data: {
        chainType: "assumptionGroupBg",
        label: `${assumptionNodes.length} assumptions`,
        groupWidth,
        groupHeight,
      },
      style: { zIndex: -1 },
      selectable: false,
      draggable: false,
    });
  }

  // Background nodes go first so they render behind
  return { nodes: [...bgNodes, ...nodes], edges };
}

// ---------------------------------------------------------------------------
// Styled Components
// ---------------------------------------------------------------------------

const IMPACT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  CRITICAL: { bg: "#f3e8f9", border: "#7b2d8e", text: "#7b2d8e" },
  MAJOR: { bg: "#fef9e7", border: "#d68910", text: "#d68910" },
  MINOR: { bg: "#eaf4fb", border: "#1a5276", text: "#1a5276" },
};

const CHAIN_TYPE_COLORS: Record<string, string> = {
  dataset: "#8AE68A",
  computation: "#FD9A9A",
  software: "#FFC107",
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

const ChainGraphContainer = styled.div`
  flex: 1;
  min-height: 400px;
  position: relative;

  .react-flow__edge-text {
    font-size: 10px;
  }
`;

const Legend = styled.div`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 11px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendSwatch = styled.div<{ $color: string; $border?: string }>`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: ${(p) => p.$color};
  border: ${(p) => (p.$border ? `2px solid ${p.$border}` : "1px solid #ddd")};
  flex-shrink: 0;
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

// ---------------------------------------------------------------------------
// Chain Node Components
// ---------------------------------------------------------------------------

const ChainNodeWrapper = styled.div<{ $bg: string; $borderColor?: string }>`
  background: ${(p) => p.$bg};
  border: 1.5px solid ${(p) => p.$borderColor || "#ccc"};
  border-radius: 6px;
  padding: 0;
  width: 180px;
  font-size: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ChainNodeHeader = styled.div<{ $bgColor: string }>`
  background: ${(p) => p.$bgColor};
  padding: 5px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #333;
  text-align: center;
`;

const ChainNodeBody = styled.div`
  padding: 6px 8px;
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
  font-size: 11px;
`;

const AssumptionNodeWrapper = styled.div<{ $bg: string; $borderColor: string }>`
  background: ${(p) => p.$bg};
  border-left: 4px solid ${(p) => p.$borderColor};
  border-radius: 4px;
  padding: 6px 10px;
  width: 200px;
  font-size: 11px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
  top: 3px;
  right: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid #aaa;
  background: #fff;
  color: #666;
  font-size: 9px;
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

// Background rectangle for assumption clusters
const GroupBgNode: React.FC<NodeProps<ChainNodeData>> = ({ data }) => {
  return (
    <div
      style={{
        width: data.groupWidth || 100,
        height: data.groupHeight || 100,
        background: "rgba(200, 180, 220, 0.12)",
        border: "1.5px dashed rgba(123, 45, 142, 0.3)",
        borderRadius: 10,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 8,
          fontSize: 9,
          color: "rgba(123, 45, 142, 0.5)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {data.label}
      </div>
    </div>
  );
};

const AssumptionChainNode: React.FC<NodeProps<ChainNodeData>> = ({ data }) => {
  if (data.chainType === "assumption") {
    const colors = IMPACT_COLORS[data.impact || "MINOR"];

    const tooltipContent = (
      <AssumptionTooltipContent>
        <div className="tooltip-impact" style={{ color: colors.text }}>{data.impact}</div>
        {data.assumptionName && <div className="tooltip-name">{data.assumptionName}</div>}
        <div className="tooltip-desc">{data.assumptionDescription || data.label}</div>
        {data.downstreamImpacts && (
          <div className="tooltip-downstream">
            <div className="tooltip-downstream-label">If Wrong</div>
            {data.downstreamImpacts}
          </div>
        )}
        {data.evidenceArtifactId && (
          <div className="tooltip-evidence">
            Evidence:{" "}
            <a href={`/view/${data.evidenceArtifactId}`} target="_blank" rel="noopener noreferrer">
              {data.evidenceArtifactId}
            </a>
            {data.evidenceLocation && <span> ({data.evidenceLocation})</span>}
          </div>
        )}
      </AssumptionTooltipContent>
    );

    return (
      <AssumptionNodeWrapper $bg={colors.bg} $borderColor={colors.border}>
        <Handle type="target" position={Position.Top} style={{ background: "#999", width: 6, height: 6 }} />
        <ImpactBadge $color={colors.text} $bg="transparent">{data.impact}</ImpactBadge>
        <div style={{ paddingRight: 18 }}>{data.label}</div>
        <Tippy content={tooltipContent} theme="light" interactive trigger="click" placement="right" appendTo={() => document.body} maxWidth={400}>
          <AssumptionInfoBtn onClick={(e) => e.stopPropagation()}>i</AssumptionInfoBtn>
        </Tippy>
        <Handle type="source" position={Position.Bottom} style={{ background: "#999", width: 6, height: 6 }} />
      </AssumptionNodeWrapper>
    );
  }

  // Provenance node (dataset, computation, software)
  const bgColor = CHAIN_TYPE_COLORS[data.chainType] || "#E0E0E0";
  const typeLabel = data.chainType.charAt(0).toUpperCase() + data.chainType.slice(1);

  return (
    <ChainNodeWrapper $bg="#fff" $borderColor={bgColor}>
      <Handle type="target" position={Position.Top} style={{ background: "#555", width: 6, height: 6 }} />
      <ChainNodeHeader $bgColor={bgColor}>
        {typeLabel}
        {data.assumptionCount !== undefined && data.assumptionCount > 0 && (
          <span style={{ marginLeft: 6, background: "rgba(0,0,0,0.15)", padding: "1px 5px", borderRadius: 3, fontSize: 9 }}>
            {data.assumptionCount}
          </span>
        )}
        {data.noAnnotation && (
          <span style={{ marginLeft: 4, fontSize: 9, opacity: 0.6 }}>(no annotations)</span>
        )}
      </ChainNodeHeader>
      <ChainNodeBody>
        {data.label}
        {data.description && (
          <div style={{ marginTop: 2, fontSize: 10, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data.description.length > 50 ? data.description.slice(0, 50) + "..." : data.description}
          </div>
        )}
      </ChainNodeBody>
      <Handle type="source" position={Position.Bottom} style={{ background: "#555", width: 6, height: 6 }} />
    </ChainNodeWrapper>
  );
};

const chainNodeTypes = {
  assumptionChainNode: AssumptionChainNode,
  assumptionGroupBg: GroupBgNode,
};

// ---------------------------------------------------------------------------
// Inner Graph (needs useReactFlow)
// ---------------------------------------------------------------------------

const ChainFlowInner: React.FC<{ nodes: Node<ChainNodeData>[]; edges: Edge[] }> = ({ nodes: rawNodes, edges: rawEdges }) => {
  const { fitView } = useReactFlow();

  const { nodes, edges } = useMemo(() => {
    if (rawNodes.length === 0) return { nodes: rawNodes, edges: rawEdges };
    // Layout the real nodes first
    const layouted = getLayoutedElements(rawNodes as Node[], rawEdges as Edge[], "TB");
    // Then add background rectangles behind assumption clusters
    return addAssumptionGroupBackgrounds(layouted.nodes as Node<ChainNodeData>[], layouted.edges);
  }, [rawNodes, rawEdges]);

  React.useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 100);
    }
  }, [nodes.length, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={chainNodeTypes}
      nodesDraggable
      nodesConnectable={false}
      minZoom={0.05}
      maxZoom={2}
      fitView={false}
    >
      <Background variant={BackgroundVariant.Dots} gap={15} size={0.5} color="#ccc" />
      <Controls />
    </ReactFlow>
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
  const { nodes, edges } = useMemo(
    () => buildAssumptionChain(datasetId, dataService),
    [datasetId, dataService]
  );

  const hasChain = nodes.length > 1;

  return (
    <ChainModalOverlay onClick={onClose}>
      <ChainModalContent onClick={(e) => e.stopPropagation()}>
        <ChainModalHeader>
          <h2>Assumption Chain: {datasetName}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </ChainModalHeader>

        {hasChain ? (
          <ChainGraphContainer>
            <ReactFlowProvider>
              <ChainFlowInner nodes={nodes} edges={edges} />
            </ReactFlowProvider>
            <Legend>
              <LegendItem>
                <LegendSwatch $color="#8AE68A" />
                <span>Dataset</span>
              </LegendItem>
              <LegendItem>
                <LegendSwatch $color="#FD9A9A" />
                <span>Computation</span>
              </LegendItem>
              <LegendItem>
                <LegendSwatch $color="#FFC107" />
                <span>Software</span>
              </LegendItem>
              <LegendItem>
                <LegendSwatch $color={IMPACT_COLORS.CRITICAL.bg} $border={IMPACT_COLORS.CRITICAL.border} />
                <span>Critical</span>
              </LegendItem>
              <LegendItem>
                <LegendSwatch $color={IMPACT_COLORS.MAJOR.bg} $border={IMPACT_COLORS.MAJOR.border} />
                <span>Major</span>
              </LegendItem>
              <LegendItem>
                <LegendSwatch $color={IMPACT_COLORS.MINOR.bg} $border={IMPACT_COLORS.MINOR.border} />
                <span>Minor</span>
              </LegendItem>
              <LegendItem>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: "rgba(200,180,220,0.12)", border: "1.5px dashed rgba(123,45,142,0.3)", flexShrink: 0 }} />
                <span>Assumption cluster</span>
              </LegendItem>
            </Legend>
          </ChainGraphContainer>
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
