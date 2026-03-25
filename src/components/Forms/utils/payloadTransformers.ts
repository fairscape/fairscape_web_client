/**
 * Payload transformation utilities for converting form data to fairscape_models format
 * Ensures JSON structure matches pydantic classes and JSON schemas
 */

export interface IdentifierValue {
  "@id": string;
}

/**
 * Transform comma-separated keywords string to array
 * @param csvString - Comma-separated keywords (e.g., "tag1, tag2, tag3")
 * @returns Array of trimmed keywords
 */
export const transformKeywordsToArray = (csvString: string): string[] => {
  if (!csvString || typeof csvString !== "string") {
    return [];
  }

  return csvString
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
};

/**
 * Transform ARK ID string(s) to IdentifierValue array format
 * @param arkIds - Single ARK ID or comma-separated ARK IDs
 * @returns Array of IdentifierValue objects
 */
export const transformToIdentifierValueArray = (
  arkIds: string | string[]
): IdentifierValue[] => {
  if (!arkIds) {
    return [];
  }

  // Handle array input
  if (Array.isArray(arkIds)) {
    return arkIds
      .filter((id) => id && id.trim())
      .map((id) => ({ "@id": id.trim() }));
  }

  // Handle comma-separated string input
  if (typeof arkIds === "string") {
    return arkIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0)
      .map((id) => ({ "@id": id }));
  }

  return [];
};

/**
 * Map entity type to full EVI schema type URI
 * @param entityType - Simple entity type (dataset, software, computation, schema)
 * @returns Full schema type URI
 */
export const getEntitySchemaType = (entityType: string): string => {
  const normalizedType = entityType.toLowerCase();

  const typeMap: { [key: string]: string } = {
    dataset: "https://w3id.org/EVI#Dataset",
    software: "https://w3id.org/EVI#Software",
    computation: "https://w3id.org/EVI#Computation",
    schema: "evi:Schema",
    annotation: "https://w3id.org/EVI#Annotation",
    experiment: "https://w3id.org/EVI#Experiment",
    sample: "https://w3id.org/EVI#Sample",
    instrument: "https://w3id.org/EVI#Instrument",
  };

  return typeMap[normalizedType] || `https://w3id.org/EVI#${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`;
};

/**
 * List of fields that should be transformed to IdentifierValue arrays
 */
const IDENTIFIER_FIELDS = [
  "generatedBy",
  "derivedFrom",
  "usedByComputation",
  "usedDataset",
  "usedSoftware",
  "usedMLModel",
  "generated",
  "dataSchema",
];

/**
 * Transform form data to match fairscape_models schema requirements
 * @param _entityType - Type of entity being created (unused but kept for API consistency)
 * @param formData - Raw form data from CreateEntityPage
 * @returns Transformed data ready for payload
 */
export const transformFormDataToPayload = (
  _entityType: string,
  formData: any
): any => {
  const transformed: any = {};

  Object.keys(formData).forEach((key) => {
    const value = formData[key];

    // Skip empty, null, or undefined values
    if (value === "" || value === null || value === undefined) {
      return;
    }

    // Transform keywords to array
    if (key === "keywords") {
      const keywordsArray = transformKeywordsToArray(value);
      if (keywordsArray.length > 0) {
        transformed[key] = keywordsArray;
      }
      return;
    }

    // Transform identifier fields to IdentifierValue arrays
    if (IDENTIFIER_FIELDS.includes(key)) {
      const identifierArray = transformToIdentifierValueArray(value);
      if (identifierArray.length > 0) {
        transformed[key] = identifierArray;
      }
      return;
    }

    // Keep other values as-is
    transformed[key] = value;
  });

  return transformed;
};

/**
 * Get additionalType value for entity
 * @param entityType - Simple entity type
 * @returns Capitalized entity type string
 */
export const getAdditionalType = (entityType: string): string => {
  return entityType.charAt(0).toUpperCase() + entityType.slice(1);
};
