import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Controls as RFControls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  useReactFlow,
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
import styled from "styled-components";

const ViewerWrapper = styled.div`
  width: 100%;
  height: 550px;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surface};
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

const nodeTypes = { evidenceNode: EvidenceNodeComponent };

interface EvidenceGraphViewerProps {
  evidenceGraphData: RawGraphData | null;
}

const GraphRenderer: React.FC<EvidenceGraphViewerProps> = ({
  evidenceGraphData,
}) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { fitView, project, panBy, getNodes } = useReactFlow();
  const initialLayoutDone = useRef(false);
  const rootNodeIdRef = useRef<string | null>(null);

  const applyLayout = useCallback(
    (
      layoutNodes: EvidenceNode[],
      layoutEdges: EvidenceEdge[],
      fit = false,
      onComplete?: () => void
    ) => {
      setIsLoading(true);

      setTimeout(() => {
        try {
          const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(layoutNodes, layoutEdges, "LR");

          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

          if (fit && !initialLayoutDone.current) {
            setTimeout(() => {
              fitView({ padding: 0.15, duration: 300 }).then(() => {
                initialLayoutDone.current = true;
              });
            }, 100);
          }
        } catch (error) {
          setNodes(layoutNodes);
          setEdges(layoutEdges);
        } finally {
          setIsLoading(false);
          if (onComplete) setTimeout(onComplete, 50);
        }
      }, 10);
    },
    [setNodes, setEdges, fitView]
  );

  useEffect(() => {
    if (evidenceGraphData) {
      initialLayoutDone.current = false;
      rootNodeIdRef.current = null;
      setIsLoading(true);

      const { nodes: initialNodes, edges: initialEdges } =
        getInitialElements(evidenceGraphData);

      if (initialNodes.length > 0) {
        rootNodeIdRef.current = initialNodes[0].id;
        applyLayout(initialNodes, initialEdges, true);
      } else {
        setNodes([]);
        setEdges([]);
        setIsLoading(false);
      }
    } else {
      setNodes([]);
      setEdges([]);
      rootNodeIdRef.current = null;
      setIsLoading(false);
    }
  }, [evidenceGraphData, applyLayout, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: EvidenceNode) => {
      if (!node.data.expandable) return;

      const currentNodes = getNodes();
      const currentEdges = edges;
      const clickedNodeObject = currentNodes.find((n) => n.id === node.id);

      if (!clickedNodeObject) return;

      let newNodes: EvidenceNode[] = [];
      let newEdges: EvidenceEdge[] = [];
      let nodeDataUpdate: Partial<any> | null = null;
      let needsLayout = false;

      if (clickedNodeObject.data.type === "DatasetCollection") {
        const expansionResult = expandDatasetCollectionNode(
          clickedNodeObject,
          currentNodes
        );
        newNodes = expansionResult.newNodes;
        newEdges = expansionResult.newEdges;
        nodeDataUpdate = expansionResult.updatedCollectionData;
        needsLayout = true;
      } else if (!clickedNodeObject.data._expanded) {
        const expansionResult = expandEvidenceNode(
          clickedNodeObject,
          currentNodes
        );
        newNodes = expansionResult.newNodes;
        newEdges = expansionResult.newEdges;

        nodeDataUpdate = {
          expandable: false, // Always set expandable to false after expansion
          _expanded: true,
        };

        needsLayout = newNodes.length > 0 || newEdges.length > 0;
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
              nextNodes.push(newNode);
            }
          });

          if (needsLayout) {
            setTimeout(() => {
              const latestEdges = [...currentEdges, ...newEdges];
              applyLayout(nextNodes, latestEdges, false, () => {
                if (rootNodeIdRef.current) {
                  const allCurrentNodesPostLayout = getNodes();
                  const rootNodePostLayout = allCurrentNodesPostLayout.find(
                    (n) => n.id === rootNodeIdRef.current
                  );

                  if (
                    rootNodePostLayout?.position &&
                    allCurrentNodesPostLayout.length > 0
                  ) {
                    fitView({ duration: 400, padding: 0.15 }).then(() => {
                      const rootNodePostFit = getNodes().find(
                        (n) => n.id === rootNodeIdRef.current
                      );
                      if (rootNodePostFit?.position) {
                        const rootScreenPos = project(rootNodePostFit.position);
                        const targetX = 100;
                        const deltaX = targetX - rootScreenPos.x;
                        if (Math.abs(deltaX) > 10) {
                          panBy({ x: deltaX, y: 0, duration: 300 });
                        }
                      }
                    });
                  }
                }
              });
            }, 0);
          }

          return nextNodes;
        });

        if (newEdges.length > 0) {
          setEdges((prevEdges) => addEdge(newEdges, prevEdges));
        }
      }
    },
    [applyLayout, setNodes, setEdges, getNodes, fitView, project, panBy, edges]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
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
    },
    [isLoading, onNodesChangeInternal]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes);
    },
    [onEdgesChangeInternal]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  return (
    <ViewerWrapper>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        nodesDraggable={!isLoading}
        nodesConnectable={false}
        minZoom={0.1}
        maxZoom={4}
        attributionPosition="bottom-left"
        fitView
        fitViewOptions={{ padding: 0.15 }}
      >
        <Background variant="dots" gap={15} size={0.5} color="#ccc" />
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
