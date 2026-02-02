import { Node, Edge } from "reactflow";

export interface RawGraphEntity {
  "@id": string;
  "@type": string | string[];
  name?: string;
  label?: string;
  description?: string;
  generatedBy?: { "@id": string } | Array<{ "@id": string }>;
  usedDataset?: { "@id": string } | Array<{ "@id": string }>;
  usedSoftware?: { "@id": string } | Array<{ "@id": string }>;
  usedSample?: { "@id": string } | Array<{ "@id": string }>;
  usedInstrument?: { "@id": string } | Array<{ "@id": string }>;
  usedMLModel?: { "@id": string } | Array<{ "@id": string }>;
  hasOutputs?: { "@id": string } | Array<{ "@id": string }>;
  createdBy?: string | { "@id": string } | Array<string | { "@id": string }>;
  [key: string]: any;
}

export interface RawGraphData {
  "@graph": { [arkId: string]: RawGraphEntity };
  outputs?: Array<{ "@id": string }>;
  [key: string]: any;
}

export interface EvidenceNodeData {
  id: string;
  type: string;
  label: string;
  displayName: string;
  description?: string;
  expandable: boolean;
  properties: Record<string, any> & {
    count?: number;
    _childNodeIds?: string[];
    _parentNodeId?: string;
    _visibleChildren?: number;
  };
  _sourceData: RawGraphEntity | {};
  _expanded?: boolean;
}

export type EvidenceNode = Node<EvidenceNodeData>;
export type EvidenceEdge = Edge;
