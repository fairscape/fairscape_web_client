import { Node, Edge } from "reactflow";

interface PredecessorInfo {
  parentId: string;
  edgeId: string;
}

export const findShortestPath = (
  startNodeId: string,
  endNodeId: string,
  nodes: Node[],
  edges: Edge[]
): { pathNodeIds: string[]; pathEdgeIds: string[] } | null => {
  if (!startNodeId || !endNodeId || startNodeId === endNodeId) {
    return null;
  }

  const startNodeExists = nodes.some((n) => n.id === startNodeId);
  const endNodeExists = nodes.some((n) => n.id === endNodeId);
  if (!startNodeExists || !endNodeExists) {
    console.warn(
      "Pathfinding skipped: Start or end node not found in the current nodes list."
    );
    return null;
  }

  const queue: string[] = [startNodeId];
  const visited: Set<string> = new Set([startNodeId]);
  const predecessorMap: Map<string, PredecessorInfo> = new Map();
  let pathFound = false;

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;

    if (currentNodeId === endNodeId) {
      pathFound = true;
      break;
    }

    const connectedEdges = edges.filter(
      (edge) => edge.source === currentNodeId || edge.target === currentNodeId
    );

    for (const edge of connectedEdges) {
      const neighborNodeId =
        edge.source === currentNodeId ? edge.target : edge.source;

      if (!visited.has(neighborNodeId)) {
        visited.add(neighborNodeId);
        predecessorMap.set(neighborNodeId, {
          parentId: currentNodeId,
          edgeId: edge.id,
        });
        queue.push(neighborNodeId);
      }
    }
  }

  if (!pathFound) {
    console.log("No path found between", startNodeId, "and", endNodeId);
    return null;
  }

  const pathNodeIds: string[] = [];
  const pathEdgeIds: string[] = [];
  let current = endNodeId;

  while (current !== startNodeId) {
    pathNodeIds.push(current);
    const predInfo = predecessorMap.get(current);
    if (!predInfo) {
      console.error(
        "Path reconstruction failed: Predecessor not found for",
        current
      );
      return null;
    }
    pathEdgeIds.push(predInfo.edgeId);
    current = predInfo.parentId;
  }
  pathNodeIds.push(startNodeId);

  return {
    pathNodeIds: pathNodeIds.reverse(),
    pathEdgeIds: pathEdgeIds.reverse(),
  };
};
