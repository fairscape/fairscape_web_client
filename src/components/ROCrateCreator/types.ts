export type FileType = "dataset" | "software";

export interface ROCrateMetadata {
  name: string;
  organizationName: string;
  projectName: string;
  description: string;
  author: string;
  keywords: string[];
  version: string;
  license: string;
}

export interface BaseMetadata {
  type: FileType;
  name: string;
  author: string;
  version: string;
  description: string;
  keywords: string[];
}

export interface DatasetMetadata extends BaseMetadata {
  type: "dataset";
  datePublished: string;
  dataFormat: string;
  schema?: string | null;
  generatedBy?: string | null;
  derivedFrom?: string[];
  usedBy?: string[];
  associatedPublication?: string | null;
  additionalDocumentation?: string | null;
}

export interface SoftwareMetadata extends BaseMetadata {
  type: "software";
  dateModified: string;
  fileFormat: string;
  usedByComputation?: string[];
  associatedPublication?: string | null;
  additionalDocumentation?: string | null;
}

export type FileMetadata = DatasetMetadata | SoftwareMetadata;

export interface FileObject {
  id: string;
  fileData: File;
  fileType: FileType;
  metadata: FileMetadata;
  metadataComplete: boolean;
}

export interface ComputationMetadata {
  id?: string;
  name: string;
  runBy: string;
  dateCreated: string;
  description: string;
  keywords: string[];
  command?: string;
  usedSoftware: string[];
  usedDataset: string[];
  generated: string[];
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "select" | "array";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helperText?: string;
}

export interface FormConfig {
  [key: string]: FormFieldConfig[];
}
