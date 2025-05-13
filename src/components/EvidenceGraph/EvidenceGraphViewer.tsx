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
  expandEvidenceNode,
  expandDatasetCollectionNode,
  buildGraphElements,
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
  targetPathToDisplay: string[] | null;
}

const GraphRenderer: React.FC<GraphRendererProps> = ({
  rawData,
  targetPathToDisplay,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<
    RFNode["data"]
  >([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<RFEdge>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fitView, getNodes, getEdges } = useReactFlow();
  const initialLayoutDone = useRef(false);
  const [pathSelectionStart, setPathSelectionStart] = useState<string | null>(
    null
  );
  const [highlightedPath, setHighlightedPath] = useState<{
    nodes: string[];
    edges: string[];
  }>({ nodes: [], edges: [] });

  const clearHighlighting = useCallback(() => {
    setHighlightedPath({ nodes: [], edges: [] });
    setPathSelectionStart(null); // Ensure selection start is also cleared
  }, []);

  const applyLayout = useCallback(
    (
      layoutNodes: RFNode[],
      layoutEdges: RFEdge[],
      fit = false, // default fit to false, will be set true on initial/path load
      onComplete?: () => void
    ) => {
      if (!layoutNodes || layoutNodes.length === 0) {
        setIsLoading(false);
        if (onComplete) onComplete();
        return;
      }
      setIsLoading(true);
      // Don't clear highlighting here if it was set by path display
      // clearHighlighting();
      setTimeout(() => {
        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(
              layoutNodes as Node[], // Cast to base Node for layout
              layoutEdges as Edge[], // Cast to base Edge for layout
              "LR"
            );
          setNodes(layoutedNodes as RFNode[]);
          setEdges(layoutedEdges as RFEdge[]);

          if (fit && !initialLayoutDone.current) {
            // Only fit view if flag is true AND not done before
            setTimeout(() => {
              fitView({ padding: 0.15, duration: 300 })
                .then(() => {
                  initialLayoutDone.current = true;
                })
                .catch((err) =>
                  console.error("FitView promise rejected:", err)
                );
            }, 100); // Delay fitView slightly after layout
          }
        } catch (error) {
          console.error("Layout failed:", error);
          // Fallback to unlayouted elements
          setNodes([...layoutNodes]);
          setEdges([...layoutEdges]);
        } finally {
          setIsLoading(false);
          if (onComplete) setTimeout(onComplete, 50);
        }
      }, 10); // Short delay for UI to register isLoading
    },
    [setNodes, setEdges, fitView /* removed clearHighlighting here */]
  );

  useEffect(() => {
    setIsLoading(true); // Set loading at the start of processing
    if (rawData) {
      initialLayoutDone.current = false; // Reset for potential fitView on new data/path
      clearHighlighting(); // Clear previous highlights unless new path is coming

      let elementsResult;
      if (targetPathToDisplay && targetPathToDisplay.length > 0) {
        console.log(
          "GraphRenderer: Building graph for target path:",
          targetPathToDisplay
        );
        elementsResult = buildGraphElements(rawData, {
          targetPath: targetPathToDisplay,
        });
        if (elementsResult.pathToHighlight) {
          setHighlightedPath(elementsResult.pathToHighlight);
        }
      } else {
        console.log("GraphRenderer: Building graph with initial depth.");
        elementsResult = buildGraphElements(rawData, { initialDepth: 2 }); // Default expansion
        // No specific path to highlight for initial depth, clearHighlighting already called
      }

      if (elementsResult.nodes.length > 0) {
        applyLayout(
          elementsResult.nodes as RFNode[],
          elementsResult.edges as RFEdge[],
          true
        );
      } else {
        setNodes([]);
        setEdges([]);
        setIsLoading(false);
      }
    } else {
      setNodes([]);
      setEdges([]);
      clearHighlighting();
      setIsLoading(false);
    }
  }, [
    rawData,
    targetPathToDisplay,
    applyLayout,
    setNodes,
    setEdges,
    clearHighlighting,
  ]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: RFNode) => {
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
          const currentNodes = getNodes(); // Use getNodes() for most up-to-date list
          const currentEdges = getEdges(); // Use getEdges()
          const pathResult = findShortestPath(
            pathSelectionStart,
            endNodeId,
            currentNodes as Node[], // Cast for findShortestPath
            currentEdges as Edge[] // Cast for findShortestPath
          );
          if (pathResult) {
            const finalNodes = [...pathResult.pathNodeIds];
            // Ensure start and end are included (should be by findShortestPath)
            setHighlightedPath({
              nodes: finalNodes,
              edges: pathResult.pathEdgeIds,
            });
          } else {
            console.warn(
              `No path found between ${pathSelectionStart} and ${endNodeId}.`
            );
            clearHighlighting(); // Clear if no path found
          }
          setPathSelectionStart(null); // Reset selection start
        }
        return;
      }

      // Regular click logic
      if (pathSelectionStart) {
        // If a path selection was in progress, cancel it
        clearHighlighting();
        event.stopPropagation(); // Prevent further actions if we just cleared a path selection
        return;
      }
      // If a path is already highlighted (e.g. from "Show Relationship" or Shift+Click)
      // and user clicks a node *not* part of that path, or just generally, clear it.
      // However, allow expanding nodes that are part of the highlighted path.
      if (
        highlightedPath.nodes.length > 0 &&
        !highlightedPath.nodes.includes(node.id)
      ) {
        clearHighlighting();
      }

      if (!node.data.expandable) {
        // If not expandable, but it's part of a highlight, don't clear highlight yet.
        // Let pane click clear it.
        event.stopPropagation();
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const currentGraphNodes = getNodes(); // Latest nodes from React Flow instance
        const currentGraphEdges = getEdges(); // Latest edges
        const clickedNodeObject = currentGraphNodes.find(
          (n) => n.id === node.id
        ) as RFNode | undefined;

        if (!clickedNodeObject) {
          console.warn(
            `Clicked node ${node.id} not found in current graph nodes.`
          );
          setIsLoading(false);
          event.stopPropagation();
          return;
        }

        let newNodesFromExpansion: EvidenceNode[] = [];
        let newEdgesFromExpansion: EvidenceEdge[] = [];
        let nodeDataUpdate: Partial<EvidenceNode["data"]> | null = null;
        let needsLayout = false;

        try {
          if (clickedNodeObject.data.type === "DatasetCollection") {
            // For manual click on collection, pass undefined for targetDatasetId
            const expansionResult = expandDatasetCollectionNode(
              clickedNodeObject as EvidenceNode,
              currentGraphNodes as EvidenceNode[],
              undefined
            );
            newNodesFromExpansion = expansionResult.newNodes;
            newEdgesFromExpansion = expansionResult.newEdges;
            nodeDataUpdate = expansionResult.updatedCollectionData;
            needsLayout = true; // Collection expansion always needs layout
          } else if (!clickedNodeObject.data._expanded) {
            // Standard node expansion
            const expansionResult = expandEvidenceNode(
              clickedNodeObject as EvidenceNode,
              currentGraphNodes as EvidenceNode[]
            );
            newNodesFromExpansion = expansionResult.newNodes;
            newEdgesFromExpansion = expansionResult.newEdges;
            nodeDataUpdate = { _expanded: true };
            needsLayout =
              newNodesFromExpansion.length > 0 ||
              newEdgesFromExpansion.length > 0;
            if (!needsLayout) {
              // If nothing new was added
              nodeDataUpdate.expandable = false;
            }
          } else {
            // Already expanded or not expandable this way
            setIsLoading(false);
            event.stopPropagation();
            return;
          }

          let updatedNodes = [...currentGraphNodes];
          let updatedEdges = [...currentGraphEdges];

          if (nodeDataUpdate) {
            const nodeIndex = updatedNodes.findIndex(
              (n) => n.id === clickedNodeObject.id
            );
            if (nodeIndex > -1) {
              updatedNodes[nodeIndex] = {
                ...updatedNodes[nodeIndex],
                data: {
                  ...updatedNodes[nodeIndex].data,
                  ...nodeDataUpdate,
                } as RFNode["data"], // Ensure correct data type
              };
            }
          }

          newNodesFromExpansion.forEach((newNode) => {
            if (!updatedNodes.some((n) => n.id === newNode.id)) {
              updatedNodes.push(newNode as RFNode);
            }
          });
          newEdgesFromExpansion.forEach((newEdge) => {
            if (!updatedEdges.some((e) => e.id === newEdge.id)) {
              updatedEdges.push(newEdge as RFEdge);
            }
          });

          // Filter edges to ensure they connect existing nodes
          const finalNodeIdsSet = new Set(updatedNodes.map((n) => n.id));
          updatedEdges = updatedEdges.filter(
            (edge) =>
              finalNodeIdsSet.has(edge.source) &&
              finalNodeIdsSet.has(edge.target)
          );

          if (needsLayout) {
            // Apply layout, but don't fit view aggressively on every click
            applyLayout(updatedNodes, updatedEdges, false);
          } else if (nodeDataUpdate) {
            // Only data updated, no new elements
            setNodes(updatedNodes);
            setIsLoading(false);
          } else {
            // No layout, no data update, implies nothing changed.
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
      setNodes, // setEdges is implicitly handled via applyLayout or direct update if no layout
      getNodes,
      getEdges, // Use ReactFlow's hooks
      clearHighlighting,
      pathSelectionStart,
      highlightedPath, // Check if highlighted path needs clearing
      // setIsLoading is implicitly part of this component's scope
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
    if (pathSelectionStart) {
      // If path selection was active, cancel it
      clearHighlighting();
    } else if (
      highlightedPath.nodes.length > 0 ||
      highlightedPath.edges.length > 0
    ) {
      // If a path was highlighted (not during selection), clear it on pane click
      clearHighlighting();
    }
  }, [clearHighlighting, pathSelectionStart, highlightedPath]);

  // Apply dynamic styling for highlighted paths to nodes and edges
  const styledNodes = nodes.map((node) => {
    const isPathNode = highlightedPath.nodes.includes(node.id);
    // More distinct styling for start/end of a path if desired
    const isStartNode = isPathNode && node.id === highlightedPath.nodes[0];
    const isEndNode =
      isPathNode &&
      node.id === highlightedPath.nodes[highlightedPath.nodes.length - 1] &&
      highlightedPath.nodes.length > 1;

    let pathClasses = "";
    if (isPathNode) pathClasses += "path-highlight ";
    if (isStartNode) pathClasses += "path-start ";
    if (isEndNode) pathClasses += "path-end ";
    // If it's the node currently selected for path selection start
    if (node.id === pathSelectionStart) pathClasses += "path-selection-start ";

    const existingClassName = node.className ?? "";
    // Ensure no duplicate classes and trim whitespace
    const combinedClasses = new Set([
      ...existingClassName.split(" "),
      ...pathClasses.split(" "),
    ]);
    const finalClassName = Array.from(combinedClasses)
      .filter(Boolean)
      .join(" ");

    return { ...node, className: finalClassName };
  });

  const styledEdges = edges.map((edge) => {
    let dynamicClasses = "";
    if (highlightedPath.edges.includes(edge.id)) {
      dynamicClasses += "path-highlight ";
    }

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
    const combinedClasses = new Set([
      ...existingClassName.split(" "),
      ...dynamicClasses.split(" "),
      ...typeClasses.split(" "),
    ]);
    const finalClassName = Array.from(combinedClasses)
      .filter(Boolean)
      .join(" ");

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
          ). Shift+click another node to complete. Or click pane to cancel.
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
        fitView={false} // FitView is handled by applyLayout or manually
        // fitViewOptions={{ padding: 0.15 }} // Default options if fitView were true
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
  const [pathToVisualize, setPathToVisualize] = useState<string[] | null>(null);

  if (!evidenceGraphData && !pathToVisualize) {
    // Also check pathToVisualize to allow rendering if path is set even if data is null (though unlikely)
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        Evidence graph data is not available.
      </div>
    );
  }

  // If evidenceGraphData becomes null AFTER a path was set, clear the path.
  useEffect(() => {
    if (!evidenceGraphData && pathToVisualize) {
      setPathToVisualize(null);
    }
  }, [evidenceGraphData, pathToVisualize]);

  return (
    <Container>
      <ReactFlowProvider>
        <GraphRenderer
          rawData={evidenceGraphData}
          targetPathToDisplay={pathToVisualize}
        />
      </ReactFlowProvider>

      <SupportingElementsComponent
        data={supportData}
        evidenceGraphData={evidenceGraphData}
        onShowRelationshipPath={setPathToVisualize}
      />
    </Container>
  );
};

export default EvidenceGraphViewer;
