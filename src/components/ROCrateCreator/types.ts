export type ObjectType = "Dataset" | "Software" | "Computation" | "Schema";

export interface ValidationResult {
  isComplete: boolean;
  missingFields: string[];
}

export interface BaseMetadataObject {
  "@id": string;
  "@type": ObjectType;
  "@context"?: any;
  name: string;
  description?: string;
  author?: string;
  version?: string;
  keywords?: string[];
  validation?: ValidationResult;
  [key: string]: any;
}

export interface DataObject extends BaseMetadataObject {
  "@type": "Dataset" | "Software";
  contentUrl?: string;
  fileData?: File;
  conformsTo?: string;
  schemaMetadata?: Record<string, any>;
  datePublished?: string;
  dateModified?: string;
  dataFormat?: string;
  fileFormat?: string;
  generatedBy?: string;
  derivedFrom?: string[];
  usedBy?: string[];
  associatedPublication?: string;
  additionalDocumentation?: string;
}

export interface ComputationObject extends BaseMetadataObject {
  "@type": "Computation";
  runBy: string;
  dateCreated: string;
  command?: string;
  usedSoftware: string[];
  usedDataset: string[];
  generated: string[];
}

export interface SchemaObject extends BaseMetadataObject {
  "@type": "Schema";
  properties: Record<string, any>;
  required: string[];
  separator?: string;
  header?: boolean;
  additionalProperties?: boolean;
  examples?: any[];
}

export type MetadataObject = DataObject | ComputationObject | SchemaObject;

export interface ROCrateMetadata {
  "@id": string;
  "@type": "Dataset";
  "@context"?: any;
  name: string;
  description: string;
  organizationName: string;
  projectName: string;
  author: string;
  keywords: string[];
  version: string;
  license: string;
  datePublished?: string;
  isPartOf?: Array<{ "@id": string }>;
}

export interface ROCrateState {
  root: ROCrateMetadata;
  objects: Map<string, MetadataObject>;
}

export interface CrateValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "array" | "number";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helperText?: string;
}

export interface FormConfig {
  [key: string]: FormFieldConfig[];
}

export interface DetectedSchema {
  name: string;
  description: string;
  properties: Record<string, any>;
  required: string[];
  confidence: number;
  extractedData?: Record<string, any>;
}
