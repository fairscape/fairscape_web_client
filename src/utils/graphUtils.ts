import {
  RawGraphEntity,
  EvidenceNodeData,
  RawGraphData,
  EvidenceNode,
  EvidenceEdge,
} from "../types/graph";

const MAX_LABEL_LENGTH = 50;

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

  let isExpandable = hasGeneratedBy || hasUsedSoftware || hasUsedDataset;

  const propertyKeys = Object.keys(entityData).filter(
    (k) =>
      !k.startsWith("@") &&
      k !== "name" &&
      k !== "label" &&
      k !== "description" &&
      k !== "generatedBy" &&
      k !== "usedDataset" &&
      k !== "usedSoftware"
  );

  if (
    type === "Software" &&
    propertyKeys.length === 0 &&
    !hasGeneratedBy &&
    !hasUsedDataset &&
    !hasUsedSoftware
  ) {
    isExpandable = false;
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
    .filter((ds) => ds && (typeof ds === "string" || ds["@id"]))
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
    _remainingDatasets: [...validDatasets],
    _expandedCount: 0,
  };

  return {
    id: collectionId,
    type: "evidenceNode",
    position: { x: 0, y: 0 },
    data: nodeData,
  };
}

export function getInitialElements(graphData: RawGraphData): {
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

  return { nodes: [rootNode], edges: [] };
}

interface ExpansionResult {
  newNodes: EvidenceNode[];
  newEdges: EvidenceEdge[];
}

export function expandEvidenceNode(
  node: EvidenceNode,
  currentNodes: EvidenceNode[]
): ExpansionResult {
  const nodeId = node.id;
  const nodeType = node.data.type;
  const sourceData = node.data._sourceData;
  const result: ExpansionResult = { newNodes: [], newEdges: [] };

  if (!sourceData || node.data._expanded) {
    return result;
  }

  const nodeExists = (id: string) =>
    currentNodes.some((n) => n.id === id) ||
    result.newNodes.some((n) => n.id === id);

  // Handle Dataset -> Computation relationship
  if (nodeType === "Dataset" && sourceData.generatedBy) {
    const computationNode = createEvidenceNode(sourceData.generatedBy);
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

  // Handle Computation -> Software relationship
  if (nodeType === "Computation" && sourceData.usedSoftware) {
    const softwareInputObject =
      typeof sourceData.usedSoftware === "string"
        ? { "@id": sourceData.usedSoftware, "@type": "evi:Software" }
        : sourceData.usedSoftware;

    const softwareNode = createEvidenceNode(softwareInputObject);
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

  // Handle Computation -> Dataset relationship
  if (nodeType === "Computation" && sourceData.usedDataset) {
    const datasets = Array.isArray(sourceData.usedDataset)
      ? sourceData.usedDataset
      : [sourceData.usedDataset];
    const validDatasetInputs = datasets.filter(
      (ds) => ds && (typeof ds === "string" || ds["@id"])
    );

    if (validDatasetInputs.length === 1) {
      const datasetInputObject =
        typeof validDatasetInputs[0] === "string"
          ? { "@id": validDatasetInputs[0], "@type": "evi:Dataset" }
          : validDatasetInputs[0];

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
          animated: false,
        });
      }
    }
  }

  return result;
}

export interface CollectionExpansionResult extends ExpansionResult {
  updatedCollectionData: Partial<EvidenceNodeData>;
}

export function expandDatasetCollectionNode(
  collectionNode: EvidenceNode,
  currentNodes: EvidenceNode[]
): CollectionExpansionResult {
  const nodeId = collectionNode.id;
  const result: ExpansionResult = { newNodes: [], newEdges: [] };
  const originalData = collectionNode.data;
  const remaining = originalData._remainingDatasets;

  if (!remaining || remaining.length === 0) {
    return {
      newNodes: [],
      newEdges: [],
      updatedCollectionData: { expandable: false },
    };
  }

  const datasetToExpand = remaining[0];
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

  const nextRemaining = remaining.slice(1);
  const nextExpandedCount = (originalData._expandedCount || 0) + 1;
  const nextExpandable = nextRemaining.length > 0;
  const nextLabel = nextExpandable
    ? `Input Datasets (${nextRemaining.length} more)`
    : `Input Datasets (All Shown)`;
  const nextDisplayName = nextExpandable
    ? `Datasets (${nextRemaining.length})`
    : `Datasets (All)`;

  const updatedCollectionData: Partial<EvidenceNodeData> = {
    _remainingDatasets: nextRemaining,
    _expandedCount: nextExpandedCount,
    expandable: nextExpandable,
    label: nextLabel,
    displayName: nextDisplayName,
  };

  return {
    ...result,
    updatedCollectionData: updatedCollectionData,
  };
}
