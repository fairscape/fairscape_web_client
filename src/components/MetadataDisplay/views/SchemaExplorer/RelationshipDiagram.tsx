import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import ReactFlow, {
  Node,
  Edge,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MarkerType,
  NodeProps,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import {
  DiagramContainer,
  TableNodeContainer,
  TableNodeHeader,
  TableNodeBody,
  TableNodeColumnRow,
  TableNodeMoreRow,
} from "./schemaExplorer.styles";
import { SchemaInfo, detectJoinKeys } from "./JoinKeyDetector";

/* ---- Schema Filter Chips ---- */

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  background: #f7f9f9;
  border: 1px solid #e2e8ea;
  border-bottom: none;
  border-radius: 2px 8px 0 0;
  align-items: center;
`;

const FilterLabel = styled.span`
  font-size: 0.78rem;
  color: #51626b;
  font-weight: 500;
  margin-right: 4px;
`;

const FilterChip = styled.button<{ $active: boolean }>`
  padding: 3px 10px;
  border-radius: 2px;
  border: 1px solid ${({ $active }) => ($active ? "#005f73" : "#E2E8EA")};
  background: ${({ $active }) => ($active ? "#005f73" : "white")};
  color: ${({ $active }) => ($active ? "white" : "#51626B")};
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #005f73;
    color: ${({ $active }) => ($active ? "white" : "#005f73")};
  }
`;

const NODE_WIDTH = 250;
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 26;
const PADDING = 12;

/* ---- Custom Node Component ---- */

interface SchemaTableNodeData {
  schemaName: string;
  joinColumns: string[];
  sampleColumns: string[];
  totalColumnCount: number;
}

const SchemaTableNode: React.FC<NodeProps<SchemaTableNodeData>> = ({
  data,
}) => {
  const remaining =
    data.totalColumnCount - data.joinColumns.length - data.sampleColumns.length;
  return (
    <TableNodeContainer>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          background: "#94d2bd",
          border: "2px solid #005f73",
        }}
      />
      <TableNodeHeader>{data.schemaName}</TableNodeHeader>
      <TableNodeBody>
        {data.joinColumns.map((col) => (
          <TableNodeColumnRow key={col} $isJoinKey>
            <span style={{ fontSize: "0.7rem" }}>&#x1F511;</span> {col}
          </TableNodeColumnRow>
        ))}
        {data.sampleColumns.map((col) => (
          <TableNodeColumnRow key={col}>{col}</TableNodeColumnRow>
        ))}
        {remaining > 0 && (
          <TableNodeMoreRow>+{remaining} more columns</TableNodeMoreRow>
        )}
      </TableNodeBody>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          background: "#94d2bd",
          border: "2px solid #005f73",
        }}
      />
    </TableNodeContainer>
  );
};

// Must be defined outside component to prevent ReactFlow remounts
const nodeTypes = { schemaTable: SchemaTableNode };

/* ---- Layout ---- */

function computeNodeHeight(
  joinCols: number,
  sampleCols: number,
  hasMore: boolean,
): number {
  const rows = joinCols + sampleCols + (hasMore ? 1 : 0);
  return HEADER_HEIGHT + rows * ROW_HEIGHT + PADDING;
}

function buildLayout(
  schemas: SchemaInfo[],
  joinKeys: ReturnType<typeof detectJoinKeys>,
  nodeSizes: Map<string, { width: number; height: number }>,
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 100, ranksep: 200 });

  for (const schema of schemas) {
    const size = nodeSizes.get(schema.id) || { width: NODE_WIDTH, height: 120 };
    g.setNode(schema.id, size);
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

/* ---- Main Component ---- */

interface RelationshipDiagramProps {
  schemas: SchemaInfo[];
}

const RelationshipDiagram: React.FC<RelationshipDiagramProps> = ({
  schemas,
}) => {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const toggleSchema = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleSchemas = useMemo(
    () => schemas.filter((s) => !excluded.has(s.id)),
    [schemas, excluded],
  );

  const joinKeys = useMemo(
    () => detectJoinKeys(visibleSchemas),
    [visibleSchemas],
  );

  const { initialNodes, initialEdges } = useMemo(() => {
    // Pre-compute node data and sizes
    const nodeDataMap = new Map<string, SchemaTableNodeData>();
    const nodeSizes = new Map<string, { width: number; height: number }>();

    for (const schema of visibleSchemas) {
      const allCols = Object.keys(schema.properties || {});
      const joinCols = joinKeys
        .filter((jk) => jk.schemas.includes(schema.name))
        .map((jk) => jk.column)
        .filter((col) => allCols.includes(col));

      const nonJoinCols = allCols.filter((c) => !joinCols.includes(c));
      const maxSample = Math.max(4 - joinCols.length, 2);
      const sampleCols = nonJoinCols.slice(0, maxSample);
      const remaining = allCols.length - joinCols.length - sampleCols.length;

      const data: SchemaTableNodeData = {
        schemaName: schema.name,
        joinColumns: joinCols,
        sampleColumns: sampleCols,
        totalColumnCount: allCols.length,
      };

      nodeDataMap.set(schema.id, data);
      nodeSizes.set(schema.id, {
        width: NODE_WIDTH,
        height: computeNodeHeight(
          joinCols.length,
          sampleCols.length,
          remaining > 0,
        ),
      });
    }

    const g = buildLayout(visibleSchemas, joinKeys, nodeSizes);

    const nodes: Node[] = visibleSchemas.map((schema) => {
      const nodeLayout = g.node(schema.id);
      const size = nodeSizes.get(schema.id)!;
      return {
        id: schema.id,
        type: "schemaTable",
        data: nodeDataMap.get(schema.id)!,
        position: {
          x: nodeLayout.x - size.width / 2,
          y: nodeLayout.y - size.height / 2,
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
          const srcSchema = visibleSchemas.find(
            (s) => s.name === jk.schemas[i],
          );
          const tgtSchema = visibleSchemas.find(
            (s) => s.name === jk.schemas[j],
          );
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
        label:
          columns.length <= 3
            ? columns.join(", ")
            : `${columns.length} shared cols`,
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
  }, [visibleSchemas, joinKeys]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when filter changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const noRelationships = visibleSchemas.length < 2 || joinKeys.length === 0;

  return (
    <>
      {schemas.length > 2 && (
        <FilterBar>
          <FilterLabel>Tables:</FilterLabel>
          {schemas.map((s) => (
            <FilterChip
              key={s.id}
              $active={!excluded.has(s.id)}
              onClick={() => toggleSchema(s.id)}
            >
              {s.name}
            </FilterChip>
          ))}
        </FilterBar>
      )}

      {noRelationships ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
          {visibleSchemas.length < 2
            ? "Select at least 2 tables to see relationships."
            : "No shared columns found between the selected tables."}
        </div>
      ) : (
        <DiagramContainer
          style={
            schemas.length > 2
              ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 }
              : undefined
          }
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Controls />
            <Background gap={16} size={1} color="#f0f0f0" />
          </ReactFlow>
        </DiagramContainer>
      )}
    </>
  );
};

export default RelationshipDiagram;
