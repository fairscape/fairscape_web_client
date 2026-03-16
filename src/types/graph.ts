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
  "evi:annotatedBy"?: Array<{ "@id": string }>;
  [key: string]: any;
}

export interface RawGraphData {
  "@graph": { [arkId: string]: RawGraphEntity };
  outputs?: Array<{ "@id": string }>;
  [key: string]: any;
}

export interface AnnotationData {
  "@id": string;
  "evi:stepSummary": string;
  "evi:codeAnalysis"?: Array<{
    software: { "@id": string };
    name?: string;
    summary: string;
    keyFunctions?: string[];
    concerns?: string[];
  }>;
  "evi:inputSummaries"?: Array<{
    dataset: { "@id": string };
    name?: string;
    role?: string;
    description?: string;
  }>;
  "evi:outputSummaries"?: Array<{
    dataset: { "@id": string };
    name?: string;
    role?: string;
    description?: string;
  }>;
  "evi:concerns"?: string[];
  "evi:llmModel": string;
  "evi:llmTemperature"?: number;
  dateCreated: string;
  "evi:interpreterVersion"?: string;
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
  _annotation?: AnnotationData;
}

export type EvidenceNode = Node<EvidenceNodeData>;
export type EvidenceEdge = Edge;

export interface AnnotatedEvidenceGraphData {
  "@id": string;
  "@type": string | string[];
  name: string;
  description: string;
  "@graph": { [arkId: string]: RawGraphEntity };
  "evi:annotates": { "@id": string };
  "evi:executiveSummary": string;
  "evi:narrativeSummary": string;
  "evi:keyFindings"?: string[];
  "evi:concerns"?: string[];
  "evi:stepAnnotations"?: Array<{ "@id": string }>;
  "evi:llmModel": string;
  dateCreated: string;
  [key: string]: any;
}
