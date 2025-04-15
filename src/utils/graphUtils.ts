import {
  RawGraphEntity,
  EvidenceNodeData,
  RawGraphData,
  EvidenceNode,
  EvidenceEdge,
} from "../types/graph"; // Adjust path if necessary

const MAX_LABEL_LENGTH = 50;

// --- Keep: getEntityType, abbreviateName, formatPropertyValue, getDisplayableProperties ---
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

export function formatPropertyValue(value: any): string {
  if (value === null || value === undefined) return "<i>null/undefined</i>";

  if (
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"))
  ) {
    return `<a href="${value}" target="_blank" rel="noopener noreferrer" style="color: #007bff;">${value}</a>`;
  }

  if (Array.isArray(value) || typeof value === "object") {
    try {
      return `<pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${JSON.stringify(
        value,
        null,
        2
      )}</pre>`;
    } catch (e) {
      return typeof value === "object" ? "[Object]" : String(value);
    }
  }

  return String(value).replace(/</g, "<").replace(/>/g, ">");
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
      properties[key] = entityData[key];
    }
  }
  return properties;
}

// --- Keep: createEvidenceNode, createDatasetCollectionNode ---
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
  const collectionId = `${computationId}_dataset_collection_${Date.now()}`;
  const validDatasets = datasets
    .filter(
      (ds) =>
        ds && (typeof ds === "string" || (typeof ds === "object" && ds["@id"]))
    ) // Ensure object has @id
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
    },
    properties: {
      count: count,
      description: `Collection of ${count} input datasets`,
    },
    _remainingDatasets: [...validDatasets] as RawGraphEntity[], // Cast remaining items
    _expandedCount: 0,
  };

  return {
    id: collectionId,
    type: "evidenceNode",
    position: { x: 0, y: 0 },
    data: nodeData,
  };
}

// --- MODIFIED getInitialElements ---
export function getInitialElements(
  graphData: RawGraphData,
  initialExpansionDepth: number = 2
): {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
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

  let currentNodes: EvidenceNode[] = [rootNode];
  let currentEdges: EvidenceEdge[] = [];
  let nodesToExpandInNextLevel: EvidenceNode[] = rootNode.data.expandable
    ? [rootNode]
    : [];

  for (let level = 0; level < initialExpansionDepth; level++) {
    const nodesExpandedInThisLevel: EvidenceNode[] = [
      ...nodesToExpandInNextLevel,
    ];
    nodesToExpandInNextLevel = []; // Reset for the next level

    if (nodesExpandedInThisLevel.length === 0) {
      break; // Stop if no more nodes to expand at this depth
    }

    nodesExpandedInThisLevel.forEach((nodeToExpand) => {
      const currentNodeInstance = currentNodes.find(
        (n) => n.id === nodeToExpand.id
      );
      // Check again if node exists and is still marked as expandable and not already processed (_expanded = false)
      if (
        !currentNodeInstance ||
        !currentNodeInstance.data.expandable ||
        currentNodeInstance.data._expanded
      ) {
        return; // Skip if not found, not expandable, or already expanded in a previous level iteration
      }

      // --- In initial expansion, ONLY expandEvidenceNode is relevant ---
      const expansionResult = expandEvidenceNode(nodeToExpand, currentNodes);
      // --- `updatedCollectionData` is not needed or used here ---

      const nodeIndex = currentNodes.findIndex((n) => n.id === nodeToExpand.id);

      if (nodeIndex !== -1) {
        const hasNewElements =
          expansionResult.newNodes.length > 0 ||
          expansionResult.newEdges.length > 0;

        if (hasNewElements) {
          // Mark the current node as expanded and no longer visually expandable
          // because its children have been added
          currentNodes[nodeIndex].data._expanded = true;
          currentNodes[nodeIndex].data.expandable = false;

          // Add newly found nodes and edges
          expansionResult.newNodes.forEach((newNode) => {
            // Add only if it's truly new to the list
            if (!currentNodes.some((n) => n.id === newNode.id)) {
              currentNodes.push(newNode);
              // If this new node is itself expandable, queue it for the next level
              if (newNode.data.expandable) {
                nodesToExpandInNextLevel.push(newNode);
              }
            }
          });

          expansionResult.newEdges.forEach((newEdge) => {
            // Add only if it's truly new
            if (!currentEdges.some((e) => e.id === newEdge.id)) {
              currentEdges.push(newEdge);
            }
          });
        } else {
          // If the expansion attempt yielded no new elements,
          // mark it as no longer expandable (as the attempt was made).
          // Do not mark _expanded = true, as nothing was actually added.
          currentNodes[nodeIndex].data.expandable = false;
        }
      }
    });
  }

  // Return the accumulated nodes and edges after the initial expansion loops
  return { nodes: currentNodes, edges: currentEdges };
}

// --- Interface Definitions ---
export interface ExpansionResult {
  newNodes: EvidenceNode[];
  newEdges: EvidenceEdge[];
}

export interface CollectionExpansionResult extends ExpansionResult {
  updatedCollectionData: Partial<EvidenceNodeData>;
}

// --- Keep: expandEvidenceNode, expandDatasetCollectionNode ---
export function expandEvidenceNode(
  node: EvidenceNode,
  currentNodes: EvidenceNode[]
): ExpansionResult {
  const nodeId = node.id;
  const nodeType = node.data.type;
  const sourceData = node.data._sourceData;
  const result: ExpansionResult = { newNodes: [], newEdges: [] };

  if (!sourceData || node.data._expanded || !node.data.expandable) {
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
      const computationNode = createEvidenceNode(computationData);
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
          animated: false,
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
      if (
        typeof softwareObject === "object" &&
        softwareObject !== null &&
        softwareObject["@id"]
      ) {
        const softwareNode = createEvidenceNode(softwareObject);
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
            animated: false,
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
      (ds) =>
        ds && (typeof ds === "string" || (typeof ds === "object" && ds["@id"]))
    );

    if (validDatasetInputs.length === 1) {
      const dsInput = validDatasetInputs[0];
      const datasetInputObject =
        typeof dsInput === "string"
          ? { "@id": dsInput, "@type": "evi:Dataset" }
          : dsInput;
      if (
        typeof datasetInputObject === "object" &&
        datasetInputObject !== null &&
        datasetInputObject["@id"]
      ) {
        const datasetNode = createEvidenceNode(datasetInputObject);
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
            animated: false,
          });
        }
      }
    } else if (validDatasetInputs.length > 1) {
      const collectionNode = createDatasetCollectionNode(
        nodeId,
        validDatasetInputs as (RawGraphEntity | string)[]
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
          animated: false,
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
        const sampleNode = createEvidenceNode(sampleObject);
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
            animated: false,
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
        const instrumentNode = createEvidenceNode(instrumentObject);
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
            animated: false,
          });
        }
      }
    });
  }

  return result;
}

export function expandDatasetCollectionNode(
  collectionNode: EvidenceNode,
  currentNodes: EvidenceNode[]
): CollectionExpansionResult {
  const nodeId = collectionNode.id;
  const result: ExpansionResult = { newNodes: [], newEdges: [] };
  const originalData = collectionNode.data;
  const remaining = originalData._remainingDatasets;

  let updatedCollectionData: Partial<EvidenceNodeData> = { expandable: false }; // Default if nothing happens

  if (!remaining || remaining.length === 0) {
    return {
      newNodes: [],
      newEdges: [],
      updatedCollectionData: { expandable: false },
    };
  }

  const datasetToExpand = remaining[0];
  if (
    typeof datasetToExpand === "object" &&
    datasetToExpand !== null &&
    datasetToExpand["@id"]
  ) {
    const datasetNode = createEvidenceNode(datasetToExpand);
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
        animated: false,
      });
    }
  }

  const nextRemaining = remaining.slice(1);
  const nextExpandedCount = (originalData._expandedCount || 0) + 1;
  const nextExpandable = nextRemaining.length > 0;
  const nextLabel = nextExpandable
    ? `Input Datasets (${nextRemaining.length} more)`
    : `Input Datasets (All Shown)`;
  const nextDisplayName = nextExpandable
    ? `Datasets (${nextRemaining.length})`
    : `Datasets (All)`;

  updatedCollectionData = {
    _remainingDatasets: nextRemaining,
    _expandedCount: nextExpandedCount,
    expandable: nextExpandable,
    label: nextLabel,
    displayName: nextDisplayName,
  };

  return { ...result, updatedCollectionData: updatedCollectionData };
}
