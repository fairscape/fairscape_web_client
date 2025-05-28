// src/interfaces.ts

// --- Core Interfaces ---

export interface ReleaseFormData {
  name: string;
  id_value: string; // User-specified or auto-generated ID
  organizationName: string;
  projectName: string;
  version: string;
  doi: string; // Mapped to identifier in JSON-LD
  description: string;
  keywords: string; // Comma-separated string from input
  associatedPublication: string; // Comma-separated string from input
  citation: string;
  usageInfo: string; // Mapped to usageInfo
  funder: string; // Mapped to funder name
  author: string; // Comma-separated string from input, mapped to author
  principal_investigator: string; // Mapped to principalInvestigator name
  contact_email: string; // Mapped to contactPoint email
  publisher: string; // Mapped to publisher name
  release_date: string; // Mapped to datePublished
  license_value: string; // Mapped to license URL/ID
  conditionsOfAccess: string; // Mapped to conditionsOfAccess
  copyrightNotice: string; // Mapped to copyrightNotice or copyrightHolder
  content_size: string; // Mapped to contentSize
  completeness: string; // Mapped to additionalProperty[@name="Completeness"]
  intended_uses: string; // Mapped to additionalProperty[@name="Intended Use"]
  prohibited_uses: string; // Mapped to additionalProperty[@name="Prohibited Uses"]
  limitations: string; // Mapped to additionalProperty[@name="Limitations"]
  potential_sources_of_bias: string; // Mapped to additionalProperty[@name="Potential Sources of Bias"]
  confidentiality_level: string; // Mapped to confidentialityLevel
  human_subject: string; // Mapped to additionalProperty[@name="Human Subject"]
  ethicalReview: string; // Mapped to ethicalReview
  customPropertiesJson: string; // Keep as raw JSON input for direct merge
}

// Use Partial for initial values as not all might be pre-filled or required
export type InitialReleaseFormValues = Partial<ReleaseFormData>;

// Interface for entities that are part of the release crate (@graph nodes)
// These will be displayed in the hasPart section and added to the @graph
export interface CrateEntity {
  "@id": string;
  "@type": string | string[];
  name?: string; // Common property for display
  // Include other common properties for display or simple data handling
  version?: string;
  author?: string | { name: string } | Array<string | { name: string }>;
  description?: string;
  filename?: string; // For File/Dataset
  fileFormat?: string; // For Software
  encodingFormat?: string; // For Dataset
  // ... potentially others based on common entity types
  // Also needs to store all properties for JSON generation, including relationships
  [key: string]: any;
}

// Interface for a dynamically added additionalProperty
export interface AdditionalProperty {
  id: string; // Unique ID for React list key (e.g., timestamp or UUID)
  name: string;
  value: string;
}

// Info parsed from an uploaded RO-Crate file
export interface UploadedCrateInfo {
  fileName: string;
  parsedJson: any; // The full parsed JSON-LD
  rootNodeId?: string; // The @id of the main root dataset/crate node
  rootNode?: any; // The parsed root node object
  entities?: CrateEntity[]; // Other entities found in the @graph
}

// Interface for available entities to link to in relationship selectors
export interface AvailableEntity {
  "@id": string;
  name?: string;
  "@type"?: string | string[];
}

// Interface for the relationship configuration from schema (re-used)
export interface RelationshipTargetConfig {
  id: string; // e.g., "usedDataset", "usedSoftware"
  label: string;
  accepts: string[]; // e.g., ["Dataset", "Software"]
}
export interface RelationshipConfig {
  sources: string[];
  targets: RelationshipTargetConfig[];
}

// Interface for entity schema properties (re-used)
export interface SchemaProperty {
  name: string; // JSON-LD property name
  label: string; // Display label
  type: string; // "text", "textarea", "keywords", "relationships", etc.
  required: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  config?: RelationshipConfig | unknown; // Config for relationships
}

// Interface for entity schema (re-used)
export interface EntitySchema {
  properties: SchemaProperty[];
}

// State to hold selected relationship IDs for AddEntityForm, keyed by target ID
export interface SelectedRelationships {
  [key: string]: string[]; // e.g., { usedDataset: ["id1", "id2"], usedSoftware: ["id3"] }
}
