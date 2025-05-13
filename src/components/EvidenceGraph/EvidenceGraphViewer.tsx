import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Controls as RFControls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Connection,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  useReactFlow,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
} from "reactflow";
import "reactflow/dist/style.css";

import Legend from "./Legend";
import EvidenceNodeComponent from "./EvidenceNode";
import LoadingSpinner from "../common/LoadingSpinner";
import SupportingElementsComponent, {
  SupportData,
} from "./SupportingElementsComponent";

import { EvidenceNode, EvidenceEdge, RawGraphData } from "../../types/graph";
import {
  getInitialElements,
  expandEvidenceNode,
  expandDatasetCollectionNode,
} from "../../utils/graphUtils";
import { getLayoutedElements } from "../../utils/layoutUtils";
import { findShortestPath } from "../../utils/pathfindingUtils";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
`;
Container.displayName = "Container";

const ViewerWrapper = styled.div`
  width: 100%;
  height: 550px;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surface};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .react-flow__node {
  }
  .react-flow__edge {
    path {
      transition: stroke 0.2s ease, stroke-width 0.2s ease;
    }
    &.path-highlight {
      z-index: 1;
      path {
        stroke: #ff0072;
        stroke-width: 2.5;
      }
    }
    &.edge-generated-by path {
    }
    &.edge-used-dataset path {
    }
    &.edge-used-software path {
    }
    &.edge-used-sample path {
    }
    &.edge-used-instrument path {
    }
    &.edge-contains path {
      stroke-dasharray: 5 3;
    }
  }
`;
ViewerWrapper.displayName = "ViewerWrapper";

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;
LoadingOverlay.displayName = "LoadingOverlay";

const LegendWrapper = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 5;
  font-size: 12px;
`;
LegendWrapper.displayName = "LegendWrapper";

const SelectionIndicator = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 114, 255, 0.1);
  color: #0056b3;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 5;
  border: 1px solid rgba(0, 114, 255, 0.3);
`;
SelectionIndicator.displayName = "SelectionIndicator";

const nodeTypes = { evidenceNode: EvidenceNodeComponent };

interface EvidenceGraphViewerProps {
  evidenceGraphData: RawGraphData | null;
  supportData: SupportData | null;
}

type RFNode = Node<EvidenceNode["data"]>;
type RFEdge = Edge<EvidenceEdge>;

interface GraphRendererProps {
  rawData: RawGraphData | null;
}

const GraphRenderer: React.FC<GraphRendererProps> = ({ rawData }) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<
    RFNode["data"]
  >([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<RFEdge>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fitView, getNodes } = useReactFlow();
  const initialLayoutDone = useRef(false);
  const rootNodeIdRef = useRef<string | null>(null);
  const [pathSelectionStart, setPathSelectionStart] = useState<string | null>(
    null
  );
  const [highlightedPath, setHighlightedPath] = useState<{
    nodes: string[];
    edges: string[];
  }>({ nodes: [], edges: [] });

  const clearHighlighting = useCallback(() => {
    setHighlightedPath({ nodes: [], edges: [] });
    setPathSelectionStart(null);
  }, []);

  const applyLayout = useCallback(
    (
      layoutNodes: RFNode[],
      layoutEdges: RFEdge[],
      fit = false,
      onComplete?: () => void
    ) => {
      if (!layoutNodes || layoutNodes.length === 0) {
        setIsLoading(false);
        if (onComplete) onComplete();
        return;
      }
      setIsLoading(true);
      clearHighlighting();
      setTimeout(() => {
        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(
              layoutNodes as Node[],
              layoutEdges as Edge[],
              "LR"
            );
          setNodes(layoutedNodes as RFNode[]);
          setEdges(layoutedEdges as RFEdge[]);
          if (fit && !initialLayoutDone.current) {
            setTimeout(() => {
              fitView({ padding: 0.15, duration: 300 })
                .then(() => {
                  initialLayoutDone.current = true;
                })
                .catch((err) =>
                  console.error("FitView promise rejected:", err)
                );
            }, 100);
          }
        } catch (error) {
          console.error("Layout failed:", error);
          setNodes([...layoutNodes]);
          setEdges([...layoutEdges]);
        } finally {
          setIsLoading(false);
          if (onComplete) setTimeout(onComplete, 50);
        }
      }, 10);
    },
    [setNodes, setEdges, fitView, clearHighlighting]
  );

  // Effect only handles graph elements now
  useEffect(() => {
    if (rawData) {
      initialLayoutDone.current = false;
      rootNodeIdRef.current = null;
      clearHighlighting(); // Clear path highlight on new data
      // Don't set isLoading here, applyLayout does
      const { nodes: initialNodes, edges: initialEdges } =
        getInitialElements(rawData);
      if (initialNodes.length > 0) {
        rootNodeIdRef.current = initialNodes[0].id;
        applyLayout(initialNodes as RFNode[], initialEdges as RFEdge[], true);
      } else {
        setNodes([]);
        setEdges([]);
        setIsLoading(false); // Turn off loading if no nodes
      }
    } else {
      setNodes([]);
      setEdges([]);
      rootNodeIdRef.current = null;
      clearHighlighting();
      setIsLoading(false);
    }
  }, [rawData, applyLayout, setNodes, setEdges, clearHighlighting]); // Removed setSupportData dependency

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: RFNode) => {
      // Shift+Click logic remains the same
      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        if (!pathSelectionStart) {
          setPathSelectionStart(node.id);
          setHighlightedPath({ nodes: [node.id], edges: [] });
        } else if (pathSelectionStart === node.id) {
          clearHighlighting();
        } else {
          const endNodeId = node.id;
          const currentNodes = getNodes();
          const currentEdges = edges;
          const pathResult = findShortestPath(
            pathSelectionStart,
            endNodeId,
            currentNodes as Node[],
            currentEdges as Edge[]
          );
          if (pathResult) {
            const finalNodes = [...pathResult.pathNodeIds];
            if (!finalNodes.includes(pathSelectionStart))
              finalNodes.unshift(pathSelectionStart);
            if (!finalNodes.includes(endNodeId)) finalNodes.push(endNodeId);
            setHighlightedPath({
              nodes: finalNodes,
              edges: pathResult.pathEdgeIds,
            });
          } else {
            console.warn(
              `No path found between ${pathSelectionStart} and ${endNodeId}.`
            );
            clearHighlighting();
          }
          setPathSelectionStart(null);
        }
        return;
      }
      // Regular click logic remains the same
      if (pathSelectionStart) {
        clearHighlighting();
        event.stopPropagation();
        return;
      }
      if (
        highlightedPath.nodes.length > 0 ||
        highlightedPath.edges.length > 0
      ) {
        clearHighlighting();
      }
      if (!node.data.expandable) {
        event.stopPropagation();
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const currentNodes = getNodes();
        const currentEdges = edges;
        const clickedNodeObject = currentNodes.find((n) => n.id === node.id);
        if (!clickedNodeObject) {
          console.warn(`Clicked node ${node.id} not found.`);
          setIsLoading(false);
          event.stopPropagation();
          return;
        }
        let newNodes: EvidenceNode[] = [];
        let newEdges: EvidenceEdge[] = [];
        let nodeDataUpdate: Partial<EvidenceNode["data"]> | null = null;
        let needsLayout = false;
        try {
          if (clickedNodeObject.data.type === "DatasetCollection") {
            const expansionResult = expandDatasetCollectionNode(
              clickedNodeObject as EvidenceNode,
              currentNodes as EvidenceNode[]
            );
            newNodes = expansionResult.newNodes;
            newEdges = expansionResult.newEdges;
            nodeDataUpdate = expansionResult.updatedCollectionData;
            needsLayout = true;
          } else if (!clickedNodeObject.data._expanded) {
            const expansionResult = expandEvidenceNode(
              clickedNodeObject as EvidenceNode,
              currentNodes as EvidenceNode[]
            );
            newNodes = expansionResult.newNodes;
            newEdges = expansionResult.newEdges;
            nodeDataUpdate = { _expanded: true };
            needsLayout = newNodes.length > 0 || newEdges.length > 0;
            if (!needsLayout) {
              nodeDataUpdate.expandable = false;
            }
          } else {
            setIsLoading(false);
            event.stopPropagation();
            return;
          }
          let nodesToUpdate = [...currentNodes];
          let edgesToUpdate = [...currentEdges];
          if (nodeDataUpdate) {
            const nodeIndex = nodesToUpdate.findIndex(
              (n) => n.id === clickedNodeObject.id
            );
            if (nodeIndex > -1) {
              nodesToUpdate[nodeIndex] = {
                ...nodesToUpdate[nodeIndex],
                data: {
                  ...nodesToUpdate[nodeIndex].data,
                  ...nodeDataUpdate,
                } as RFNode["data"],
              };
            }
          }
          newNodes.forEach((newNode) => {
            if (!nodesToUpdate.some((n) => n.id === newNode.id)) {
              nodesToUpdate.push(newNode as RFNode);
            }
          });
          newEdges.forEach((newEdge) => {
            if (!edgesToUpdate.some((e) => e.id === newEdge.id)) {
              edgesToUpdate.push(newEdge as RFEdge);
            }
          });
          const nodeIdsToUpdateSet = new Set(nodesToUpdate.map((n) => n.id));
          edgesToUpdate = edgesToUpdate.filter(
            (edge) =>
              nodeIdsToUpdateSet.has(edge.source) &&
              nodeIdsToUpdateSet.has(edge.target)
          );
          if (needsLayout) {
            applyLayout(nodesToUpdate, edgesToUpdate, false);
          } else if (nodeDataUpdate) {
            setNodes(nodesToUpdate);
            setIsLoading(false);
          } else {
            console.warn(
              "Node click handler finished without updates or layout."
            );
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error during node expansion:", error);
          setIsLoading(false);
        }
        event.stopPropagation();
      }, 10);
    },
    [
      applyLayout,
      setNodes,
      edges,
      getNodes,
      clearHighlighting,
      pathSelectionStart,
      highlightedPath,
      setIsLoading,
    ]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const relevantChanges = changes.filter(
        (change) =>
          !isLoading || (change.type === "position" && change.dragging === true)
      );
      if (relevantChanges.length > 0) {
        onNodesChangeInternal(relevantChanges);
      }
      changes.forEach((change) => {
        if (change.type === "remove") {
          if (
            highlightedPath.nodes.includes(change.id) ||
            pathSelectionStart === change.id
          ) {
            clearHighlighting();
          }
        }
      });
    },
    [
      isLoading,
      onNodesChangeInternal,
      highlightedPath,
      pathSelectionStart,
      clearHighlighting,
    ]
  );
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
      changes.forEach((change) => {
        if (change.type === "remove") {
          if (highlightedPath.edges.includes(change.id)) {
            clearHighlighting();
          }
        }
      });
    },
    [onEdgesChangeInternal, highlightedPath, clearHighlighting]
  );
  const onConnect = useCallback((params: Connection) => {
    console.log("Manual connection attempt blocked:", params);
  }, []);
  const onPaneClick = useCallback(() => {
    clearHighlighting();
  }, [clearHighlighting]);

  const styledNodes = nodes.map((node) => {
    const isPathNode = highlightedPath.nodes.includes(node.id);
    const isStartOrEndNode =
      isPathNode &&
      (node.id === highlightedPath.nodes[0] ||
        node.id === highlightedPath.nodes[highlightedPath.nodes.length - 1]);
    const highlightClasses = `${isStartOrEndNode ? "path-start-end" : ""} ${
      isPathNode ? "path-highlight" : ""
    }`.trim();
    const existingClassName = node.className ?? "";
    const finalClassName = `${existingClassName} ${highlightClasses}`.trim();
    return { ...node, className: finalClassName };
  });
  const styledEdges = edges.map((edge) => {
    const highlightClasses = `${
      highlightedPath.edges.includes(edge.id) ? "path-highlight" : ""
    }`.trim();
    const typeClasses =
      edge.label === "generated by"
        ? "edge-generated-by"
        : edge.label === "used dataset"
        ? "edge-used-dataset"
        : edge.label === "used software"
        ? "edge-used-software"
        : edge.label === "used sample"
        ? "edge-used-sample"
        : edge.label === "used instrument"
        ? "edge-used-instrument"
        : edge.label === "contains"
        ? "edge-contains"
        : "";
    const existingClassName = edge.className ?? "";
    const finalClassName =
      `${existingClassName} ${highlightClasses} ${typeClasses}`.trim();
    return { ...edge, className: finalClassName };
  });

  return (
    <ViewerWrapper>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      {pathSelectionStart && (
        <SelectionIndicator>
          Selecting path: Start node set (
          {nodes.find((n) => n.id === pathSelectionStart)?.data?.displayName ||
            pathSelectionStart}
          ). Shift+click another node to complete.
        </SelectionIndicator>
      )}
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodesDraggable={!isLoading}
        nodesConnectable={false}
        minZoom={0.1}
        maxZoom={4}
        attributionPosition="bottom-left"
        fitView={false}
        fitViewOptions={{ padding: 0.15 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={15}
          size={0.5}
          color="#ccc"
        />
        <RFControls />
        <LegendWrapper>
          <Legend />
        </LegendWrapper>
      </ReactFlow>
    </ViewerWrapper>
  );
};

const EvidenceGraphViewer: React.FC<EvidenceGraphViewerProps> = ({
  evidenceGraphData,
  supportData,
}) => {
  if (!evidenceGraphData) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        Evidence graph data is not available.
      </div>
    );
  }

  return (
    <Container>
      <ReactFlowProvider>
        <GraphRenderer rawData={evidenceGraphData} />
      </ReactFlowProvider>

      <SupportingElementsComponent
        data={supportData}
        evidenceGraphData={evidenceGraphData}
      />
    </Container>
  );
};

export default EvidenceGraphViewer;
