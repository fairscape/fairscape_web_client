// src/components/EvidenceGraph/EvidenceGraphViewer.tsx
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
  useStoreApi,
} from "reactflow";
import "reactflow/dist/style.css";

import Legend from "./Legend";
import EvidenceNodeComponent from "./EvidenceNode";
import LoadingSpinner from "../common/LoadingSpinner";

import { EvidenceNode, EvidenceEdge, RawGraphData } from "../../types/graph";
import {
  getInitialElements,
  expandEvidenceNode,
  expandDatasetCollectionNode,
} from "../../utils/graphUtils";
import { getLayoutedElements } from "../../utils/layoutUtils";
import { findShortestPath } from "../../utils/pathfindingUtils"; // Import the new utility
import styled, { css } from "styled-components";

const ViewerWrapper = styled.div`
  width: 100%;
  height: 550px;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surface};

  /* Add CSS for highlighting */
  .react-flow__node {
    &.path-highlight {
      box-shadow: 0 0 0 3px rgba(255, 0, 114, 0.7);
      border-color: rgba(255, 0, 114, 0.9);
      z-index: 2; /* Bring highlighted nodes to front */
    }
    &.path-start-end {
      box-shadow: 0 0 0 4px rgba(0, 114, 255, 0.7);
      border: 2px solid rgba(0, 114, 255, 0.9);
      z-index: 3; /* Bring start/end nodes even more to front */
    }
  }

  .react-flow__edge {
    path {
      transition: stroke 0.2s ease, stroke-width 0.2s ease;
    }
    &.path-highlight {
      z-index: 1; /* Bring highlighted edges to front */
      path {
        stroke: #ff0072;
        stroke-width: 2.5;
      }
    }

    &.edge-contains path {
      stroke-dasharray: 5 3;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

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

const nodeTypes = { evidenceNode: EvidenceNodeComponent };

interface EvidenceGraphViewerProps {
  evidenceGraphData: RawGraphData | null;
}

type RFNode = Node<EvidenceNode["data"]>;
type RFEdge = Edge<EvidenceEdge>;

const GraphRenderer: React.FC<EvidenceGraphViewerProps> = ({
  evidenceGraphData,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<
    RFNode["data"]
  >([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<RFEdge>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fitView, project, getNodes, getEdges } = useReactFlow();
  const store = useStoreApi();
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
              const { width, height } = store.getState();
              if (width > 0 && height > 0) {
                const result = fitView({ padding: 0.15, duration: 300 });
                Promise.resolve(result)
                  .then(() => {
                    initialLayoutDone.current = true;
                  })
                  .catch((err) =>
                    console.error("FitView promise rejected:", err)
                  );
              } else {
                setTimeout(
                  () =>
                    fitView({ padding: 0.15, duration: 300 }).then(() => {
                      initialLayoutDone.current = true;
                    }),
                  500
                );
              }
            }, 100);
          }
        } catch (error) {
          console.error("Layout failed:", error);
          setNodes(layoutNodes);
          setEdges(layoutEdges);
        } finally {
          setIsLoading(false);
          if (onComplete) setTimeout(onComplete, 50);
        }
      }, 10);
    },
    [setNodes, setEdges, fitView, store, clearHighlighting]
  );

  useEffect(() => {
    if (evidenceGraphData) {
      initialLayoutDone.current = false;
      rootNodeIdRef.current = null;
      setIsLoading(true);
      clearHighlighting();

      const { nodes: initialNodes, edges: initialEdges } =
        getInitialElements(evidenceGraphData);

      if (initialNodes.length > 0) {
        rootNodeIdRef.current = initialNodes[0].id;
        applyLayout(initialNodes as RFNode[], initialEdges as RFEdge[], true);
      } else {
        setNodes([]);
        setEdges([]);
        setIsLoading(false);
      }
    } else {
      setNodes([]);
      setEdges([]);
      rootNodeIdRef.current = null;
      clearHighlighting();
      setIsLoading(false);
    }
  }, [evidenceGraphData, applyLayout, setNodes, setEdges, clearHighlighting]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: RFNode) => {
      if (event.shiftKey) {
        event.preventDefault();

        if (!pathSelectionStart) {
          setPathSelectionStart(node.id);
          setHighlightedPath({ nodes: [node.id], edges: [] });
        } else if (pathSelectionStart === node.id) {
          clearHighlighting();
        } else {
          const endNodeId = node.id;
          const currentNodes = getNodes();
          const currentEdges = getEdges();

          const pathResult = findShortestPath(
            pathSelectionStart,
            endNodeId,
            currentNodes,
            currentEdges
          );

          if (pathResult) {
            const finalNodes = [...pathResult.pathNodeIds];
            // Ensure start and end nodes are included and in correct order
            if (!finalNodes.includes(pathSelectionStart))
              finalNodes.unshift(pathSelectionStart);
            if (!finalNodes.includes(endNodeId)) finalNodes.push(endNodeId);

            setHighlightedPath({
              nodes: finalNodes,
              edges: pathResult.pathEdgeIds,
            });
          } else {
            clearHighlighting();
          }
          setPathSelectionStart(null);
        }
        return;
      }

      if (
        highlightedPath.nodes.length > 0 ||
        highlightedPath.edges.length > 0
      ) {
        clearHighlighting();
      }

      if (!node.data.expandable) return;

      const currentNodes = getNodes();
      const currentEdges = getEdges();
      const clickedNodeObject = currentNodes.find((n) => n.id === node.id);

      if (!clickedNodeObject) return;

      let newNodes: EvidenceNode[] = [];
      let newEdges: EvidenceEdge[] = [];
      let nodeDataUpdate: Partial<any> | null = null;
      let needsLayout = false;

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

        nodeDataUpdate = {
          _expanded: true,
        };

        needsLayout = newNodes.length > 0 || newEdges.length > 0;
        if (!needsLayout) {
          nodeDataUpdate.expandable = false;
        }
      } else {
        return;
      }

      const hasNewElements = newNodes.length > 0 || newEdges.length > 0;
      const nodeStateChanged = nodeDataUpdate !== null;

      if (hasNewElements || nodeStateChanged) {
        setNodes((prevNodes) => {
          let nextNodes = [...prevNodes];

          if (nodeStateChanged && nodeDataUpdate) {
            const nodeIndex = nextNodes.findIndex(
              (n) => n.id === clickedNodeObject.id
            );
            if (nodeIndex > -1) {
              nextNodes[nodeIndex] = {
                ...nextNodes[nodeIndex],
                data: {
                  ...nextNodes[nodeIndex].data,
                  ...nodeDataUpdate,
                },
              };
            }
          }

          newNodes.forEach((newNode) => {
            if (!nextNodes.some((n) => n.id === newNode.id)) {
              nextNodes.push(newNode as RFNode);
            }
          });

          if (needsLayout) {
            setTimeout(() => {
              const latestNodes = store.getState().nodes;
              const latestEdgesFromState = store.getState().edges;
              const combinedEdgesForLayout = [
                ...latestEdgesFromState,
                ...(newEdges as RFEdge[]),
              ];

              applyLayout(
                latestNodes as RFNode[],
                combinedEdgesForLayout as RFEdge[],
                false
              );
            }, 0);
          }

          return nextNodes;
        });

        if (newEdges.length > 0) {
          setEdges((prevEdges) => {
            const edgesToAdd = newEdges as RFEdge[];
            const uniqueEdgesToAdd = edgesToAdd.filter(
              (newEdge) =>
                !prevEdges.some(
                  (existingEdge) => existingEdge.id === newEdge.id
                )
            );
            return [...prevEdges, ...uniqueEdgesToAdd];
          });
        }
      }
    },
    [
      applyLayout,
      setNodes,
      setEdges,
      getNodes,
      getEdges,
      pathSelectionStart,
      highlightedPath,
      clearHighlighting,
      store,
    ]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (isLoading) {
        const nonPositionChanges = changes.filter(
          (change) =>
            change.type !== "position" ||
            (change.type === "position" && change.dragging === true)
        );
        if (nonPositionChanges.length > 0) {
          onNodesChangeInternal(nonPositionChanges);
        }
      } else {
        onNodesChangeInternal(changes);
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
    (changes) => {
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
    console.log("Connection attempt blocked:", params);
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

    return {
      ...node,
      className: `${node.className ?? ""} ${
        isStartOrEndNode ? "path-start-end" : ""
      } ${isPathNode ? "path-highlight" : ""}`.trim(),
    };
  });

  const styledEdges = edges.map((edge) => ({
    ...edge,
    className: `${edge.className ?? ""} ${
      highlightedPath.edges.includes(edge.id) ? "path-highlight" : ""
    } ${
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
        : ""
    }`.trim(),
  }));

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
          {getNodes().find((n) => n.id === pathSelectionStart)?.data
            ?.displayName || pathSelectionStart}
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
}) => {
  return (
    <ReactFlowProvider>
      <GraphRenderer evidenceGraphData={evidenceGraphData} />
    </ReactFlowProvider>
  );
};

export default EvidenceGraphViewer;
