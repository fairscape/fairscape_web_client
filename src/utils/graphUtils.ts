// src/utils/graphUtils.ts
import {
  RawGraphEntity,
  EvidenceNodeData,
  RawGraphData,
  EvidenceNode,
  EvidenceEdge,
} from "../types/graph";

const MAX_LABEL_LENGTH = 50;

const feUrl =
  import.meta.env.VITE_FAIRSCAPE_FE_URL || "http://localhost:5173/view/";

export function getEntityType(typeUri: string | string[] | undefined): string {
  if (!typeUri) return "Unknown";
  const typeString = Array.isArray(typeUri) ? typeUri[0] : typeUri;
  return typeString.split(/[#\/]/).pop() || "Unknown";
}

export function abbreviateName(
  name: string | undefined,
  maxLength = MAX_LABEL_LENGTH
): string {
  if (!name) return "";
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 3) + "...";
}

export function formatPropertyValue(value: any, propKey?: string): string {
  if (value === null || value === undefined) {
    return "<em>Not specified</em>";
  }

  if (typeof value === "string") {
    if (value.startsWith("ark:")) {
      const fullUrl = `${feUrl}${value}`;
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    }

    const urlRegex = /^(https?:\/\/\S+)$/;
    if (urlRegex.test(value)) {
      return `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    }

    if (propKey === "command") {
      return `<pre>${value}</pre>`;
    }

    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatPropertyValue(item)).join("<br/>");
  }

  if (typeof value === "object" && value !== null) {
    if (value["@id"]) {
      return formatPropertyValue(value["@id"]);
    }
    try {
      return `<pre>${JSON.stringify(value, null, 2)}</pre>`;
    } catch (e) {
      return "[Object]";
    }
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

export function getDisplayableProperties(
  entityData: RawGraphEntity | EvidenceNodeData["_sourceData"] | undefined
): Record<string, any> {
  const excludeKeys = [
    "@id",
    "@type",
    "generatedBy",
    "usedDataset",
    "usedSoftware",
    "usedSample",
    "usedInstrument",
    "_sourceData",
    "_remainingDatasets",
    "_expandedCount",
    "label",
    "displayName",
    "description",
    "expandable",
    "id",
    "type",
    "properties",
    "_expanded",
  ];

  const properties: Record<string, any> = {};
  if (!entityData) return properties;

  for (const key in entityData) {
    if (!excludeKeys.includes(key) && !key.startsWith("_")) {
      properties[key] = (entityData as Record<string, any>)[key];
    }
  }
  return properties;
}

export function createEvidenceNode(
  entityData: RawGraphEntity
): EvidenceNode | null {
  if (!entityData || !entityData["@id"]) return null;

  const id = entityData["@id"];
  const type = getEntityType(entityData["@type"]);
  const label = entityData.name || entityData.label || entityData["@id"];
  const displayName = abbreviateName(label);
  const description = entityData.description || "";

  const hasGeneratedBy = !!entityData.generatedBy;
  const hasUsedSoftware = !!entityData.usedSoftware;
  const hasUsedDataset =
    entityData.usedDataset &&
    (Array.isArray(entityData.usedDataset)
      ? entityData.usedDataset.length > 0
      : true);
  const hasUsedSample =
    entityData.usedSample &&
    (Array.isArray(entityData.usedSample)
      ? entityData.usedSample.length > 0
      : true);
  const hasUsedInstrument =
    entityData.usedInstrument &&
    (Array.isArray(entityData.usedInstrument)
      ? entityData.usedInstrument.length > 0
      : true);

  let isExpandable =
    hasGeneratedBy ||
    hasUsedSoftware ||
    hasUsedDataset ||
    hasUsedSample ||
    hasUsedInstrument;

  if (type !== "DatasetCollection") {
    const propertyKeys = Object.keys(entityData).filter(
      (k) =>
        !k.startsWith("@") &&
        k !== "name" &&
        k !== "label" &&
        k !== "description" &&
        k !== "generatedBy" &&
        k !== "usedDataset" &&
        k !== "usedSoftware" &&
        k !== "usedSample" &&
        k !== "usedInstrument"
    );

    if (
      type === "Software" &&
      propertyKeys.length === 0 &&
      !hasGeneratedBy &&
      !hasUsedDataset &&
      !hasUsedSoftware &&
      !hasUsedSample &&
      !hasUsedInstrument
    ) {
      const displayableProps = getDisplayableProperties(entityData);
      if (Object.keys(displayableProps).length === 0) {
        isExpandable = false;
      }
    }

    if (
      Object.keys(entityData).length <= 2 &&
      entityData["@id"] &&
      entityData["@type"]
    ) {
      isExpandable = false;
    }
  }

  const nodeData: EvidenceNodeData = {
    id: id,
    type: type,
    label: label,
    displayName: displayName,
    description: description,
    expandable: isExpandable,
    _sourceData: { ...entityData },
    properties: getDisplayableProperties(entityData),
    _expanded: false,
  };

  return {
    id: id,
    type: "evidenceNode",
    position: { x: 0, y: 0 },
    data: nodeData,
  };
}

export function createDatasetCollectionNode(
  computationId: string,
  datasets: (RawGraphEntity | string)[]
): EvidenceNode | null {
  const collectionId = `${computationId}_dataset_collection_${
    datasets.length
  }_${Date.now()}`;
  const validDatasets = datasets
    .filter(
      (ds) =>
        ds && (typeof ds === "string" || (typeof ds === "object" && ds["@id"]))
    )
    .map((ds) =>
      typeof ds === "string" ? { "@id": ds, "@type": "evi:Dataset" } : ds
    );

  const count = validDatasets.length;
  if (count === 0) return null;

  const label = `Input Datasets (${count})`;
  const displayName = `Datasets (${count})`;

  const nodeData: EvidenceNodeData = {
    id: collectionId,
    type: "DatasetCollection",
    label: label,
    displayName: displayName,
    expandable: count > 0,
    _sourceData: {
      "@id": collectionId,
      "@type": "evi:DatasetCollection",
      name: label,
      description: `A collection of ${count} datasets used by ${computationId
        .split(/[/#]/)
        .pop()}`,
      count: count,
      contains: validDatasets.map((vd) =>
        typeof vd === "string" ? { "@id": vd } : { "@id": vd["@id"] }
      ),
    },
    properties: {
      count: count,
      description: `Collection of ${count} input datasets`,
    },
    _remainingDatasets: [...validDatasets] as RawGraphEntity[],
    _expandedCount: 0,
  };

  return {
    id: collectionId,
    type: "evidenceNode",
    position: { x: 0, y: 0 },
    data: nodeData,
  };
}

export interface ExpansionResult {
  newNodes: EvidenceNode[];
  newEdges: EvidenceEdge[];
}

export interface CollectionExpansionResult extends ExpansionResult {
  updatedCollectionData: Partial<EvidenceNodeData>;
}

export function expandEvidenceNode(
  node: EvidenceNode,
  currentNodes: EvidenceNode[]
): ExpansionResult {
  const nodeId = node.id;
  const nodeType = node.data.type;
  const sourceData = node.data._sourceData;
  const result: ExpansionResult = { newNodes: [], newEdges: [] };

  if (!sourceData || !node.data.expandable) {
    return result;
  }

  const nodeExists = (id: string) =>
    currentNodes.some((n) => n.id === id) ||
    result.newNodes.some((n) => n.id === id);

  if (nodeType === "Dataset" && sourceData.generatedBy) {
    const computationData = sourceData.generatedBy;
    if (
      typeof computationData === "object" &&
      computationData !== null &&
      computationData["@id"]
    ) {
      const computationNode = createEvidenceNode(
        computationData as RawGraphEntity
      );
      if (computationNode) {
        if (!nodeExists(computationNode.id)) {
          result.newNodes.push(computationNode);
        }
        result.newEdges.push({
          id: `${nodeId}_generated_by_${computationNode.id}`,
          source: nodeId,
          target: computationNode.id,
          type: "smoothstep",
          label: "generated by",
        });
      }
    }
  }

  if (
    (nodeType === "Computation" || nodeType === "Experiment") &&
    sourceData.usedSoftware
  ) {
    const softwareItems = Array.isArray(sourceData.usedSoftware)
      ? sourceData.usedSoftware
      : [sourceData.usedSoftware];

    softwareItems.forEach((software) => {
      if (!software) return;
      const softwareObject =
        typeof software === "string"
          ? { "@id": software, "@type": "evi:Software" }
          : software;
      if (softwareObject && softwareObject["@id"]) {
        const softwareNode = createEvidenceNode(
          softwareObject as RawGraphEntity
        );
        if (softwareNode) {
          if (!nodeExists(softwareNode.id)) {
            result.newNodes.push(softwareNode);
          }
          result.newEdges.push({
            id: `${nodeId}_uses_sw_${softwareNode.id}`,
            source: nodeId,
            target: softwareNode.id,
            type: "smoothstep",
            label: "used software",
          });
        }
      }
    });
  }

  if (
    (nodeType === "Computation" || nodeType === "Experiment") &&
    sourceData.usedDataset
  ) {
    const datasets = Array.isArray(sourceData.usedDataset)
      ? sourceData.usedDataset
      : [sourceData.usedDataset];
    const validDatasetInputs = datasets.filter(
      (ds): ds is RawGraphEntity | string =>
        ds && (typeof ds === "string" || (typeof ds === "object" && ds["@id"]))
    );

    if (validDatasetInputs.length === 1) {
      const dsInput = validDatasetInputs[0];
      const datasetInputObject =
        typeof dsInput === "string"
          ? { "@id": dsInput, "@type": "evi:Dataset" }
          : dsInput;
      if (datasetInputObject && datasetInputObject["@id"]) {
        const datasetNode = createEvidenceNode(
          datasetInputObject as RawGraphEntity
        );
        if (datasetNode) {
          if (!nodeExists(datasetNode.id)) {
            result.newNodes.push(datasetNode);
          }
          result.newEdges.push({
            id: `${nodeId}_uses_ds_${datasetNode.id}`,
            source: nodeId,
            target: datasetNode.id,
            type: "smoothstep",
            label: "used dataset",
          });
        }
      }
    } else if (validDatasetInputs.length > 1) {
      const collectionNode = createDatasetCollectionNode(
        nodeId,
        validDatasetInputs
      );
      if (collectionNode) {
        if (!nodeExists(collectionNode.id)) {
          result.newNodes.push(collectionNode);
        }
        result.newEdges.push({
          id: `${nodeId}_uses_coll_${collectionNode.id}`,
          source: nodeId,
          target: collectionNode.id,
          type: "smoothstep",
          label: "used dataset",
        });
      }
    }
  }

  if (
    (nodeType === "Computation" || nodeType === "Experiment") &&
    sourceData.usedSample
  ) {
    const samples = Array.isArray(sourceData.usedSample)
      ? sourceData.usedSample
      : [sourceData.usedSample];
    samples.forEach((sample) => {
      if (!sample) return;
      const sampleObject =
        typeof sample === "string"
          ? { "@id": sample, "@type": "evi:Sample" }
          : sample;
      if (
        typeof sampleObject === "object" &&
        sampleObject !== null &&
        sampleObject["@id"]
      ) {
        const sampleNode = createEvidenceNode(sampleObject as RawGraphEntity);
        if (sampleNode) {
          if (!nodeExists(sampleNode.id)) {
            result.newNodes.push(sampleNode);
          }
          result.newEdges.push({
            id: `${nodeId}_uses_sample_${sampleNode.id}`,
            source: nodeId,
            target: sampleNode.id,
            type: "smoothstep",
            label: "used sample",
          });
        }
      }
    });
  }

  if (
    (nodeType === "Computation" || nodeType === "Experiment") &&
    sourceData.usedInstrument
  ) {
    const instruments = Array.isArray(sourceData.usedInstrument)
      ? sourceData.usedInstrument
      : [sourceData.usedInstrument];
    instruments.forEach((instrument) => {
      if (!instrument) return;
      const instrumentObject =
        typeof instrument === "string"
          ? { "@id": instrument, "@type": "evi:Instrument" }
          : instrument;
      if (
        typeof instrumentObject === "object" &&
        instrumentObject !== null &&
        instrumentObject["@id"]
      ) {
        const instrumentNode = createEvidenceNode(
          instrumentObject as RawGraphEntity
        );
        if (instrumentNode) {
          if (!nodeExists(instrumentNode.id)) {
            result.newNodes.push(instrumentNode);
          }
          result.newEdges.push({
            id: `${nodeId}_uses_instrument_${instrumentNode.id}`,
            source: nodeId,
            target: instrumentNode.id,
            type: "smoothstep",
            label: "used instrument",
          });
        }
      }
    });
  }

  return result;
}

export function expandDatasetCollectionNode(
  collectionNode: EvidenceNode,
  currentNodes: EvidenceNode[],
  targetDatasetId?: string
): CollectionExpansionResult {
  const nodeId = collectionNode.id;
  const originalData = collectionNode.data;
  const result: ExpansionResult = { newNodes: [], newEdges: [] };

  let datasetToExpandEntity: RawGraphEntity | undefined = undefined;
  let remainingAfterExpansion = [...(originalData._remainingDatasets || [])];

  if (targetDatasetId) {
    const targetIndex = remainingAfterExpansion.findIndex(
      (dsEntry) =>
        (typeof dsEntry === "string" ? dsEntry : dsEntry["@id"]) ===
        targetDatasetId
    );

    if (targetIndex > -1) {
      const foundDatasetEntry = remainingAfterExpansion.splice(
        targetIndex,
        1
      )[0];
      datasetToExpandEntity =
        typeof foundDatasetEntry === "string"
          ? ({
              "@id": foundDatasetEntry,
              "@type": "evi:Dataset",
              name: foundDatasetEntry,
            } as RawGraphEntity)
          : foundDatasetEntry;
    } else {
      console.warn(
        `Target dataset ${targetDatasetId} not found in remaining for collection ${collectionNode.id}.`
      );
      return {
        newNodes: [],
        newEdges: [],
        updatedCollectionData: {
          _remainingDatasets: remainingAfterExpansion,
          expandable: remainingAfterExpansion.length > 0,
          label:
            remainingAfterExpansion.length > 0
              ? `Input Datasets (${remainingAfterExpansion.length} more)`
              : `Input Datasets (All Shown)`,
          displayName:
            remainingAfterExpansion.length > 0
              ? `Datasets (${remainingAfterExpansion.length})`
              : `Datasets (All)`,
        },
      };
    }
  } else {
    if (remainingAfterExpansion.length > 0) {
      const firstDatasetEntry = remainingAfterExpansion.shift();
      datasetToExpandEntity =
        typeof firstDatasetEntry === "string"
          ? ({
              "@id": firstDatasetEntry,
              "@type": "evi:Dataset",
              name: firstDatasetEntry,
            } as RawGraphEntity)
          : firstDatasetEntry;
    }
  }

  if (!datasetToExpandEntity || !datasetToExpandEntity["@id"]) {
    return {
      newNodes: [],
      newEdges: [],
      updatedCollectionData: {
        _remainingDatasets: [],
        _expandedCount: originalData._expandedCount,
        expandable: false,
        label: `Input Datasets (All Shown)`,
        displayName: `Datasets (All)`,
      },
    };
  }

  const datasetNode = createEvidenceNode(datasetToExpandEntity);
  const nodeExists = (id: string) =>
    currentNodes.some((n) => n.id === id) ||
    result.newNodes.some((n) => n.id === id);

  if (datasetNode) {
    if (!nodeExists(datasetNode.id)) {
      result.newNodes.push(datasetNode);
    }
    result.newEdges.push({
      id: `${nodeId}_contains_${datasetNode.id}_${
        originalData._expandedCount || 0
      }`,
      source: nodeId,
      target: datasetNode.id,
      type: "smoothstep",
      label: "contains",
    });
  }

  const nextExpandedCount = (originalData._expandedCount || 0) + 1;
  const nextExpandable = remainingAfterExpansion.length > 0;
  const nextLabel = nextExpandable
    ? `Input Datasets (${remainingAfterExpansion.length} more)`
    : `Input Datasets (All Shown)`;
  const nextDisplayName = nextExpandable
    ? `Datasets (${remainingAfterExpansion.length})`
    : `Datasets (All)`;

  const updatedCollectionData: Partial<EvidenceNodeData> = {
    _remainingDatasets: remainingAfterExpansion,
    _expandedCount: nextExpandedCount,
    expandable: nextExpandable,
    label: nextLabel,
    displayName: nextDisplayName,
  };

  return { ...result, updatedCollectionData };
}

interface BuildGraphElementsOptions {
  initialDepth?: number;
  targetPath?: string[];
}

export function buildGraphElements(
  graphData: RawGraphData,
  options: BuildGraphElementsOptions
): {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  pathToHighlight?: { nodes: string[]; edges: string[] };
} {
  if (!graphData || !graphData["@graph"]) {
    return { nodes: [], edges: [] };
  }

  const rootEntities = Array.isArray(graphData["@graph"])
    ? graphData["@graph"]
    : [graphData["@graph"]];

  if (!rootEntities || rootEntities.length === 0) {
    return { nodes: [], edges: [] };
  }

  const rootEntity = rootEntities[0];
  const rootNode = createEvidenceNode(rootEntity);

  if (!rootNode) {
    return { nodes: [], edges: [] };
  }

  let allNodesMasterList: EvidenceNode[] = [rootNode];
  let allEdgesMasterList: EvidenceEdge[] = [];
  let highlightedPathOutput: { nodes: string[]; edges: string[] } | undefined =
    undefined;

  const currentNodesMap = new Map<string, EvidenceNode>(
    allNodesMasterList.map((n) => [n.id, JSON.parse(JSON.stringify(n))])
  ); // Deep copy for manipulation

  if (options.targetPath && options.targetPath.length > 0) {
    console.log("Building graph for target path:", options.targetPath);
    highlightedPathOutput = { nodes: [], edges: [] };

    if (options.targetPath[0] !== rootNode.id) {
      console.warn(
        "Target path does not start with the graph's root node. Path expansion aborted."
      );
      return { nodes: [rootNode], edges: [], pathToHighlight: undefined };
    }
    highlightedPathOutput.nodes.push(rootNode.id);

    let currentParentIdInPath = rootNode.id;

    for (let i = 0; i < options.targetPath.length - 1; i++) {
      const actualTargetIdInPath = options.targetPath[i + 1];
      let parentNodeToExpand = currentNodesMap.get(currentParentIdInPath);

      if (!parentNodeToExpand) {
        console.warn(
          `[Path Expansion] Current parent node ${currentParentIdInPath} not found. Stopping path expansion.`
        );
        break;
      }

      // Ensure expandable for this step
      parentNodeToExpand.data = {
        ...parentNodeToExpand.data,
        expandable: true,
        _expanded: false,
      };

      const regularExpansion = expandEvidenceNode(
        parentNodeToExpand,
        Array.from(currentNodesMap.values())
      );

      // Update parent node's state after expansion attempt
      parentNodeToExpand.data._expanded = true;
      currentNodesMap.set(parentNodeToExpand.id, parentNodeToExpand);

      // Add newly discovered nodes and edges from regular expansion
      regularExpansion.newNodes.forEach((newNode) => {
        if (!currentNodesMap.has(newNode.id)) {
          currentNodesMap.set(newNode.id, JSON.parse(JSON.stringify(newNode)));
        }
      });
      regularExpansion.newEdges.forEach((newEdge) => {
        if (!allEdgesMasterList.some((e) => e.id === newEdge.id)) {
          allEdgesMasterList.push(newEdge);
        }
      });

      // Now, check if actualTargetIdInPath is directly connected or via a new collection
      let foundDirectly =
        currentNodesMap.has(actualTargetIdInPath) &&
        allEdgesMasterList.some(
          (e) =>
            (e.source === currentParentIdInPath &&
              e.target === actualTargetIdInPath) ||
            (e.target === currentParentIdInPath &&
              e.source === actualTargetIdInPath)
        );

      let collectionNodeMediary: EvidenceNode | undefined = undefined;

      if (!foundDirectly) {
        // Check if a collection was created that might contain actualTargetIdInPath
        collectionNodeMediary = regularExpansion.newNodes.find(
          (n) =>
            n.data.type === "DatasetCollection" &&
            (n.data._remainingDatasets || []).some(
              (ds) =>
                (typeof ds === "string" ? ds : ds["@id"]) ===
                actualTargetIdInPath
            )
        );
      }

      if (foundDirectly) {
        // Target is directly connected
        highlightedPathOutput.nodes.push(actualTargetIdInPath);
        const edgeToHighlight = allEdgesMasterList.find(
          (e) =>
            (e.source === currentParentIdInPath &&
              e.target === actualTargetIdInPath) ||
            (e.target === currentParentIdInPath &&
              e.source === actualTargetIdInPath)
        );
        if (edgeToHighlight) {
          highlightedPathOutput.edges.push(edgeToHighlight.id);
        } else {
          console.warn(
            `[Path Expansion] Direct edge for ${currentParentIdInPath} -> ${actualTargetIdInPath} not found, though target node exists.`
          );
        }
        currentParentIdInPath = actualTargetIdInPath; // Move to next step in path
      } else if (collectionNodeMediary) {
        // Target is inside a newly created collection
        console.log(
          `[Path Expansion] Target ${actualTargetIdInPath} is in collection ${collectionNodeMediary.id}. Expanding collection.`
        );

        // 1. Highlight path to collection
        highlightedPathOutput.nodes.push(collectionNodeMediary.id);
        const edgeToCollection = allEdgesMasterList.find(
          (e) =>
            e.source === currentParentIdInPath &&
            e.target === collectionNodeMediary!.id
        );
        if (edgeToCollection) {
          highlightedPathOutput.edges.push(edgeToCollection.id);
        } else {
          console.warn(
            `[Path Expansion] Edge to collection ${collectionNodeMediary.id} not found.`
          );
        }

        // 2. Expand the collection to reveal actualTargetIdInPath
        let collectionToExpand = currentNodesMap.get(collectionNodeMediary.id); // Get mutable copy
        if (!collectionToExpand) {
          // Should exist as it was just added
          console.error("Critical: Collection node disappeared from map.");
          break;
        }
        collectionToExpand.data = {
          ...collectionToExpand.data,
          expandable: true,
          _expanded: false,
        }; // Ensure it can be expanded

        const collectionExpansionResult = expandDatasetCollectionNode(
          collectionToExpand,
          Array.from(currentNodesMap.values()),
          actualTargetIdInPath
        );

        // Update collection node state
        collectionToExpand.data = {
          ...collectionToExpand.data,
          ...collectionExpansionResult.updatedCollectionData,
        };
        currentNodesMap.set(collectionToExpand.id, collectionToExpand);

        collectionExpansionResult.newNodes.forEach((newNode) => {
          if (!currentNodesMap.has(newNode.id)) {
            currentNodesMap.set(
              newNode.id,
              JSON.parse(JSON.stringify(newNode))
            );
          }
        });
        collectionExpansionResult.newEdges.forEach((newEdge) => {
          if (!allEdgesMasterList.some((e) => e.id === newEdge.id)) {
            allEdgesMasterList.push(newEdge);
          }
        });

        // 3. Highlight path from collection to target
        if (currentNodesMap.has(actualTargetIdInPath)) {
          highlightedPathOutput.nodes.push(actualTargetIdInPath);
          const edgeFromCollection = allEdgesMasterList.find(
            (e) =>
              e.source === collectionNodeMediary!.id &&
              e.target === actualTargetIdInPath
          );
          if (edgeFromCollection) {
            highlightedPathOutput.edges.push(edgeFromCollection.id);
          } else {
            console.warn(
              `[Path Expansion] Edge from collection ${collectionNodeMediary.id} to ${actualTargetIdInPath} not found.`
            );
          }
          currentParentIdInPath = actualTargetIdInPath; // Move to next step in path
        } else {
          console.warn(
            `[Path Expansion] Target ${actualTargetIdInPath} not found after expanding collection ${collectionNodeMediary.id}. Stopping path.`
          );
          break;
        }
      } else {
        // Target not found directly or via a new collection
        console.warn(
          `[Path Expansion] Child ${actualTargetIdInPath} not found after expanding ${currentParentIdInPath}. Cannot proceed with path segment.`
        );
        // Also check if actualTargetIdInPath was already present but not connected from currentParentIdInPath
        const targetNodeExists = currentNodesMap.has(actualTargetIdInPath);
        console.warn(
          `[Path Expansion] Details: Target node ${actualTargetIdInPath} ${
            targetNodeExists ? "exists" : "does not exist"
          } in map. No valid connection from ${currentParentIdInPath}.`
        );
        break;
      }
    }
    allNodesMasterList = Array.from(currentNodesMap.values());
  } else if (options.initialDepth !== undefined && options.initialDepth > 0) {
    console.log("Building graph with initial depth:", options.initialDepth);
    let nodesToExpandInNextLevel: string[] = [];
    if (rootNode.data.expandable && !rootNode.data._expanded) {
      nodesToExpandInNextLevel.push(rootNode.id);
    }

    for (let level = 0; level < options.initialDepth; level++) {
      const expandingNowIds = [...nodesToExpandInNextLevel];
      nodesToExpandInNextLevel = [];
      if (expandingNowIds.length === 0) break;

      expandingNowIds.forEach((nodeIdToExpand) => {
        let nodeToExpand = currentNodesMap.get(nodeIdToExpand);
        if (
          !nodeToExpand ||
          !nodeToExpand.data.expandable ||
          nodeToExpand.data._expanded
        ) {
          return;
        }

        const expansionResult = expandEvidenceNode(
          nodeToExpand,
          Array.from(currentNodesMap.values())
        );

        const hasNewElements =
          expansionResult.newNodes.length > 0 ||
          expansionResult.newEdges.length > 0;

        nodeToExpand.data._expanded = true;
        if (nodeToExpand.data.type !== "DatasetCollection") {
          if (!hasNewElements) nodeToExpand.data.expandable = false;
        }
        currentNodesMap.set(nodeToExpand.id, nodeToExpand);

        expansionResult.newNodes.forEach((newNode) => {
          if (!currentNodesMap.has(newNode.id)) {
            currentNodesMap.set(
              newNode.id,
              JSON.parse(JSON.stringify(newNode))
            );
            if (
              newNode.data.expandable &&
              newNode.data.type !== "DatasetCollection" &&
              !newNode.data._expanded
            ) {
              nodesToExpandInNextLevel.push(newNode.id);
            }
          }
        });
        expansionResult.newEdges.forEach((newEdge) => {
          if (!allEdgesMasterList.some((e) => e.id === newEdge.id)) {
            allEdgesMasterList.push(newEdge);
          }
        });
      });
    }
    allNodesMasterList = Array.from(currentNodesMap.values());
  } else {
    console.log("Building graph with root node only.");
    allNodesMasterList = [rootNode];
    allEdgesMasterList = [];
  }

  const finalNodeIds = new Set(allNodesMasterList.map((n) => n.id));
  allEdgesMasterList = allEdgesMasterList.filter(
    (e) => finalNodeIds.has(e.source) && finalNodeIds.has(e.target)
  );

  if (highlightedPathOutput) {
    highlightedPathOutput.nodes = highlightedPathOutput.nodes.filter((nodeId) =>
      finalNodeIds.has(nodeId)
    );
    highlightedPathOutput.edges = highlightedPathOutput.edges.filter((edgeId) =>
      allEdgesMasterList.some((edge) => edge.id === edgeId)
    );
  }

  return {
    nodes: allNodesMasterList,
    edges: allEdgesMasterList,
    pathToHighlight: highlightedPathOutput,
  };
}
