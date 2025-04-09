// src/types/graph.ts (Keep your existing file)
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
    type: string; // e.g., 'Dataset', 'Computation'
    label: string; // Full name/label
    displayName: string; // Abbreviated name for node display
    description?: string;
    expandable: boolean; // Can this node be clicked to expand?
    properties: Record<string, any>; // Key-value pairs for display (simple ones)
    _sourceData: RawGraphEntity; // Original JSON-LD fragment
    _remainingDatasets?: RawGraphEntity[]; // Specific to DatasetCollection
    _expandedCount?: number; // Specific to DatasetCollection
    _expanded?: boolean; // Has this node been expanded?
  }
  
  // Use Node and Edge from reactflow
  import { Node, Edge } from 'reactflow';
  export type EvidenceNode = Node<EvidenceNodeData>;
  export type EvidenceEdge = Edge;
  
  