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

// Path finding function for the full evidence graph
export const findPathInFullGraph = (
  graphData: any,
  targetId: string
): string[] | null => {
  if (!graphData || !targetId) return null;

  // Extract the root entity
  const rootEntity = Array.isArray(graphData["@graph"])
    ? graphData["@graph"][0]
    : graphData["@graph"];

  if (!rootEntity || !rootEntity["@id"]) return null;

  // Track visited nodes to prevent infinite loops
  const visited = new Set<string>();

  // Helper function for DFS traversal
  const findPathToTarget = (
    currentEntity: any,
    currentPath: string[] = []
  ): string[] | null => {
    if (!currentEntity || !currentEntity["@id"]) return null;

    const currentId = currentEntity["@id"];

    // Skip if already visited to prevent cycles
    if (visited.has(currentId)) return null;
    visited.add(currentId);

    // Add current node to path
    currentPath = [...currentPath, currentId];

    // Check if we found the target
    if (currentId === targetId) {
      return currentPath;
    }

    // Check generatedBy relationship
    if (currentEntity.generatedBy) {
      const result = findPathToTarget(currentEntity.generatedBy, currentPath);
      if (result) return result;
    }

    // Check usedDataset relationship (single or array)
    if (currentEntity.usedDataset) {
      const datasets = Array.isArray(currentEntity.usedDataset)
        ? currentEntity.usedDataset
        : [currentEntity.usedDataset];

      for (const dataset of datasets) {
        // Skip if not an object with @id
        if (!dataset || typeof dataset !== "object" || !dataset["@id"])
          continue;

        const result = findPathToTarget(dataset, currentPath);
        if (result) return result;
      }
    }

    // Check usedSoftware relationship (single or array)
    if (currentEntity.usedSoftware) {
      const software = Array.isArray(currentEntity.usedSoftware)
        ? currentEntity.usedSoftware
        : [currentEntity.usedSoftware];

      for (const sw of software) {
        // Skip if not an object with @id
        if (!sw || typeof sw !== "object" || !sw["@id"]) continue;

        const result = findPathToTarget(sw, currentPath);
        if (result) return result;
      }
    }

    // Check usedSample relationship (if exists)
    if (currentEntity.usedSample) {
      const samples = Array.isArray(currentEntity.usedSample)
        ? currentEntity.usedSample
        : [currentEntity.usedSample];

      for (const sample of samples) {
        // Skip if not an object with @id
        if (!sample || typeof sample !== "object" || !sample["@id"]) continue;

        const result = findPathToTarget(sample, currentPath);
        if (result) return result;
      }
    }

    // Check usedInstrument relationship (if exists)
    if (currentEntity.usedInstrument) {
      const instruments = Array.isArray(currentEntity.usedInstrument)
        ? currentEntity.usedInstrument
        : [currentEntity.usedInstrument];

      for (const instrument of instruments) {
        // Skip if not an object with @id
        if (!instrument || typeof instrument !== "object" || !instrument["@id"])
          continue;

        const result = findPathToTarget(instrument, currentPath);
        if (result) return result;
      }
    }

    // No path found via this node
    return null;
  };

  // Start the search from the root entity
  return findPathToTarget(rootEntity);
};
