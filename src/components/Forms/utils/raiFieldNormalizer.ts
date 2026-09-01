/**
 * RAI Field Normalizer
 *
 * Normalizes RAI (Responsible AI) fields to match the Fairscape API schema.
 * Some fields must be strings, others must be arrays.
 *
 * Based on ROCrateMetadataElem schema from Fairscape API.
 */

// Fields that MUST be strings (not arrays)
const STRING_RAI_FIELDS = [
  "rai:dataLimitations",
  "rai:dataBiases",
  "rai:dataUseCases",
  "rai:dataReleaseMaintenancePlan",
  "rai:dataCollection",
  "rai:dataCollectionMissingData",
  "rai:dataCollectionRawData",
  "rai:dataImputationProtocol",
  "rai:dataManipulationProtocol",
  "rai:dataAnnotationProtocol",
  "rai:dataSocialImpact",
  "rai:annotationsPerItem",
] as const;

// Fields that MUST be arrays (not strings)
const ARRAY_RAI_FIELDS = [
  "rai:dataCollectionType",
  "rai:dataCollectionTimeframe",
  "rai:dataPreprocessingProtocol",
  "rai:dataAnnotationPlatform",
  "rai:dataAnnotationAnalysis",
  "rai:personalSensitiveInformation",
  "rai:annotatorDemographics",
  "rai:machineAnnotationTools",
] as const;

// All RAI fields
export const ALL_RAI_FIELDS = [
  ...STRING_RAI_FIELDS,
  ...ARRAY_RAI_FIELDS,
] as const;

/**
 * Convert a value to a string.
 * Arrays are joined with newlines.
 */
function toStringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.map(String).join("\n");
  }
  return String(value);
}

/**
 * Convert a value to an array of strings.
 * Strings are split by newlines.
 */
function toArrayValue(value: unknown): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(value)];
}

/**
 * Normalize a single RAI field value based on its expected type.
 */
export function normalizeRaiFieldValue(
  fieldName: string,
  value: unknown,
): string | string[] | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if ((STRING_RAI_FIELDS as readonly string[]).includes(fieldName)) {
    const str = toStringValue(value);
    return str || null;
  }

  if ((ARRAY_RAI_FIELDS as readonly string[]).includes(fieldName)) {
    const arr = toArrayValue(value);
    return arr.length > 0 ? arr : null;
  }

  // Unknown field - return as-is
  return value as string | string[];
}

/**
 * Normalize all RAI fields in an object for API submission.
 * Ensures each field matches the expected type (string or array).
 *
 * @param data - Object containing RAI fields (can have other fields too)
 * @returns New object with normalized RAI field values
 */
export function normalizeRaiFieldsForApi<T extends Record<string, unknown>>(
  data: T,
): T {
  const result = { ...data };

  for (const field of ALL_RAI_FIELDS) {
    if (field in result) {
      const normalized = normalizeRaiFieldValue(field, result[field]);
      if (normalized === null) {
        delete result[field];
      } else {
        (result as Record<string, unknown>)[field] = normalized;
      }
    }
  }

  return result;
}

/**
 * Normalize all RAI fields for form display (all as strings).
 * Arrays are converted to newline-separated strings for textarea editing.
 *
 * @param data - Object containing RAI fields
 * @returns New object with all RAI fields as strings
 */
export function normalizeRaiFieldsForForm<T extends Record<string, unknown>>(
  data: T,
): T {
  const result = { ...data };

  for (const field of ALL_RAI_FIELDS) {
    if (
      field in result &&
      result[field] !== null &&
      result[field] !== undefined
    ) {
      (result as Record<string, unknown>)[field] = toStringValue(result[field]);
    } else {
      (result as Record<string, unknown>)[field] = "";
    }
  }

  return result;
}
