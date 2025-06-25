export interface RawGraphEntity {
  "@id": string;
  "@type": string | string[];
  name?: string;
  label?: string;
  description?: string;
  generatedBy?: RawGraphEntity;
  usedDataset?: RawGraphEntity | RawGraphEntity[] | string | string[];
  usedSoftware?: RawGraphEntity | string;
  [key: string]: any;
}

export interface RawGraphData {
  "@graph": RawGraphEntity | RawGraphEntity[];
  [key: string]: any;
}

export interface EvidenceNodeData {
  id: string;
  type: string;
  label: string;
  displayName: string;
  description?: string;
  expandable: boolean;
  properties: Record<string, any>;
  _sourceData: RawGraphEntity;
  _remainingDatasets?: RawGraphEntity[];
  _expandedCount?: number;
  _expanded?: boolean;
}

import { Node, Edge } from "reactflow";
export type EvidenceNode = Node<EvidenceNodeData>;
export type EvidenceEdge = Edge;
