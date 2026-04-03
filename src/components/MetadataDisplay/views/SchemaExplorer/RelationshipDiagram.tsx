import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Position,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { DiagramContainer } from "./schemaExplorer.styles";
import { SchemaInfo, detectJoinKeys } from "./JoinKeyDetector";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 60;

function buildLayout(
  schemas: SchemaInfo[],
  joinKeys: ReturnType<typeof detectJoinKeys>
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 120 });

  for (const schema of schemas) {
    g.setNode(schema.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  const edgeSet = new Set<string>();
  for (const jk of joinKeys) {
    for (let i = 0; i < jk.schemas.length; i++) {
      for (let j = i + 1; j < jk.schemas.length; j++) {
        const srcSchema = schemas.find((s) => s.name === jk.schemas[i]);
        const tgtSchema = schemas.find((s) => s.name === jk.schemas[j]);
        if (srcSchema && tgtSchema) {
          const key = [srcSchema.id, tgtSchema.id].sort().join("--");
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            g.setEdge(srcSchema.id, tgtSchema.id);
          }
        }
      }
    }
  }

  dagre.layout(g);
  return g;
}

interface RelationshipDiagramProps {
  schemas: SchemaInfo[];
}

const RelationshipDiagram: React.FC<RelationshipDiagramProps> = ({
  schemas,
}) => {
  const joinKeys = useMemo(() => detectJoinKeys(schemas), [schemas]);

  const { initialNodes, initialEdges } = useMemo(() => {
    const g = buildLayout(schemas, joinKeys);

    const nodes: Node[] = schemas.map((schema) => {
      const nodeData = g.node(schema.id);
      const colCount = Object.keys(schema.properties || {}).length;
      return {
        id: schema.id,
        data: {
          label: (
            <div style={{ textAlign: "center" }}>
              <div
                style={{ fontWeight: 600, fontSize: "0.85rem", color: "#005f73" }}
              >
                {schema.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                {colCount} columns
              </div>
            </div>
          ),
        },
        position: {
          x: nodeData.x - NODE_WIDTH / 2,
          y: nodeData.y - NODE_HEIGHT / 2,
        },
        style: {
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          border: "2px solid #94d2bd",
          borderRadius: "8px",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    // Build edges with labels showing shared columns
    const edgeMap: Record<string, string[]> = {};
    for (const jk of joinKeys) {
      for (let i = 0; i < jk.schemas.length; i++) {
        for (let j = i + 1; j < jk.schemas.length; j++) {
          const srcSchema = schemas.find((s) => s.name === jk.schemas[i]);
          const tgtSchema = schemas.find((s) => s.name === jk.schemas[j]);
          if (srcSchema && tgtSchema) {
            const key = [srcSchema.id, tgtSchema.id].sort().join("--");
            if (!edgeMap[key]) edgeMap[key] = [];
            edgeMap[key].push(jk.column);
          }
        }
      }
    }

    const edges: Edge[] = Object.entries(edgeMap).map(([key, columns]) => {
      const [source, target] = key.split("--");
      return {
        id: key,
        source,
        target,
        label: columns.length <= 3 ? columns.join(", ") : `${columns.length} shared cols`,
        labelStyle: { fontSize: "0.72rem", fill: "#495057" },
        labelBgStyle: { fill: "white", fillOpacity: 0.9 },
        labelBgPadding: [4, 4] as [number, number],
        labelBgBorderRadius: 4,
        style: { stroke: "#94d2bd", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94d2bd" },
        type: "default",
      };
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [schemas, joinKeys]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (schemas.length < 2 || joinKeys.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
        Relationship diagram requires at least 2 schemas with shared columns.
      </div>
    );
  }

  return (
    <DiagramContainer>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Controls />
        <Background gap={16} size={1} color="#f0f0f0" />
      </ReactFlow>
    </DiagramContainer>
  );
};

export default RelationshipDiagram;
