import React, { useEffect, useState, useCallback, useRef } from "react";
import styled from "styled-components";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";

import { RawGraphData, EvidenceNode, EvidenceEdge } from "../../types/graph";
import { GraphDataService } from "./GraphDataService";
import { GraphBuilder } from "./graphUtils";
import { getLayoutedElements } from "../EvidenceGraph/utils/layoutUtils";
import AnnotatedEvidenceNodeComponent from "./AnnotatedEvidenceNode";

export const GraphDataServiceContext = React.createContext<GraphDataService | null>(null);

const ViewerWrapper = styled.div`
  width: 100%;
  height: 600px;
  position: relative;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;

  .react-flow__edge path {
    transition: stroke 0.2s ease, stroke-width 0.2s ease;
  }

  @keyframes node-highlight-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(44, 62, 80, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(44, 62, 80, 0.15); }
  }

  .react-flow__node.highlighted-node > div {
    border: 3px solid #2c3e50;
    animation: node-highlight-pulse 0.8s ease-in-out 3;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-size: 14px;
  color: #666;
`;

const nodeTypes = { evidenceNode: AnnotatedEvidenceNodeComponent };
type RFNode = Node<EvidenceNode["data"]>;
type RFEdge = Edge<EvidenceEdge>;

interface GraphRendererProps {
  dataService: GraphDataService | null;
  highlightNodeId?: string | null;
}

const GraphRenderer: React.FC<GraphRendererProps> = ({ dataService, highlightNodeId }) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<RFNode["data"]>([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<RFEdge>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fitView } = useReactFlow();
  const graphBuilderRef = useRef<GraphBuilder | null>(null);

  const applyLayout = useCallback(
    (elements: { nodes: EvidenceNode[]; edges: EvidenceEdge[] }, fit = false) => {
      setIsLoading(true);
      setTimeout(() => {
        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            elements.nodes as Node[],
            elements.edges as Edge[],
            "LR"
          );
          setNodes(layoutedNodes as RFNode[]);
          setEdges(layoutedEdges as RFEdge[]);
          if (fit) setTimeout(() => fitView({ padding: 0.15, duration: 300 }), 100);
        } catch (e) {
          console.error("Layout failed:", e);
          setNodes(elements.nodes as RFNode[]);
          setEdges(elements.edges as RFEdge[]);
        } finally {
          setIsLoading(false);
        }
      }, 10);
    },
    [setNodes, setEdges, fitView]
  );

  useEffect(() => {
    if (!dataService) {
      setNodes([]);
      setEdges([]);
      return;
    }
    graphBuilderRef.current = new GraphBuilder(dataService);
    const elements = graphBuilderRef.current.buildInitialGraph(3);
    applyLayout(elements, true);
  }, [dataService, applyLayout]);

  // Highlight a node when highlightNodeId changes
  useEffect(() => {
    if (!highlightNodeId || !nodes.length) return;
    const targetNode = nodes.find((n) => n.id === highlightNodeId);
    if (!targetNode) return;

    // Pan to the node
    if (targetNode.position) {
      fitView({ nodes: [{ id: highlightNodeId }], padding: 0.5, duration: 500 });
    }

    // Apply highlight class
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        className: n.id === highlightNodeId ? "highlighted-node" : "",
      }))
    );

    // Remove highlight after animation
    const timer = setTimeout(() => {
      setNodes((nds) =>
        nds.map((n) => ({ ...n, className: "" }))
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [highlightNodeId, nodes.length, fitView, setNodes]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: RFNode) => {
      if (!dataService || !graphBuilderRef.current) return;
      if (!node.data.expandable) return;

      setIsLoading(true);
      setTimeout(() => {
        if (graphBuilderRef.current) {
          const elements = graphBuilderRef.current.expandNode(node.id);
          applyLayout(elements, false);
        }
      }, 10);
    },
    [dataService, applyLayout]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const relevant = changes.filter(
        (c) => !isLoading || (c.type === "position" && c.dragging === true)
      );
      if (relevant.length) onNodesChangeInternal(relevant);
    },
    [isLoading, onNodesChangeInternal]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => onEdgesChangeInternal(changes),
    [onEdgesChangeInternal]
  );

  return (
    <GraphDataServiceContext.Provider value={dataService}>
      <ViewerWrapper>
        {isLoading && <LoadingOverlay>Building graph...</LoadingOverlay>}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          nodesDraggable={!isLoading}
          nodesConnectable={false}
          minZoom={0.1}
          maxZoom={4}
          fitView={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={15} size={0.5} color="#ccc" />
          <Controls />
        </ReactFlow>
      </ViewerWrapper>
    </GraphDataServiceContext.Provider>
  );
};

interface AnnotatedGraphViewerProps {
  graphData: RawGraphData | null;
  highlightNodeId?: string | null;
}

const AnnotatedGraphViewer: React.FC<AnnotatedGraphViewerProps> = ({ graphData, highlightNodeId }) => {
  const [dataService, setDataService] = useState<GraphDataService | null>(null);

  useEffect(() => {
    if (graphData) {
      setDataService(new GraphDataService(graphData));
    } else {
      setDataService(null);
    }
  }, [graphData]);

  if (!graphData) {
    return (
      <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ddd", borderRadius: 8, background: "#f8f9fa", color: "#666" }}>
        No annotated evidence graph data available
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <GraphRenderer dataService={dataService} highlightNodeId={highlightNodeId} />
    </ReactFlowProvider>
  );
};

export default AnnotatedGraphViewer;
