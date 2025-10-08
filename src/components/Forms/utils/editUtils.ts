interface EditConfig {
  type: string;
  sections: Array<{
    id: string;
    title: string;
    fields: Array<{
      name: string;
      label: string;
      type: string;
      required?: boolean;
      readonly?: boolean;
      placeholder?: string;
      description?: string;
    }>;
  }>;
}

export function getAllConfigFieldNames(config: EditConfig): Set<string> {
  const fieldNames = new Set<string>();
  config.sections.forEach((section) => {
    section.fields.forEach((field) => {
      fieldNames.add(field.name);
    });
  });
  return fieldNames;
}

function deserializeIdentifierValue(value: any): string {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "object" && item["@id"]) {
          return item["@id"];
        }
        return String(item);
      })
      .join(", ");
  }

  if (typeof value === "object" && value["@id"]) {
    return value["@id"];
  }

  return String(value);
}

function deserializeKeywords(value: any): string {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

export function parseMetadataToForm(metadata: any, config: EditConfig): any {
  const formData: any = {};
  const configFields = getAllConfigFieldNames(config);

  configFields.forEach((fieldName) => {
    if (metadata[fieldName] !== undefined) {
      const field = config.sections
        .flatMap((s) => s.fields)
        .find((f) => f.name === fieldName);

      if (field?.type === "identifier_list") {
        formData[fieldName] = deserializeIdentifierValue(metadata[fieldName]);
      } else if (field?.type === "keywords") {
        formData[fieldName] = deserializeKeywords(metadata[fieldName]);
      } else {
        formData[fieldName] = metadata[fieldName];
      }
    } else {
      formData[fieldName] = "";
    }
  });

  return formData;
}

export function extractExtraFields(metadata: any, config: EditConfig): any {
  const configFields = getAllConfigFieldNames(config);
  const extraFields: any = {};

  Object.keys(metadata).forEach((key) => {
    if (!configFields.has(key) && key !== "@context" && key !== "@type") {
      extraFields[key] = metadata[key];
    }
  });

  return extraFields;
}

function serializeIdentifierValue(value: string, fieldType?: string): any {
  if (!value || !value.trim()) return undefined;

  if (fieldType === "identifier_list") {
    const ids = value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) return undefined;
    return ids.map((id) => ({ "@id": id }));
  }

  if (value.startsWith("ark:") || value.startsWith("http")) {
    return { "@id": value };
  }

  return value;
}

function serializeKeywords(value: string): any {
  if (!value || !value.trim()) return undefined;

  const keywords = value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (keywords.length === 0) return undefined;
  return keywords;
}

export function generateUpdatePayload(
  formData: any,
  extraFields: any,
  metadata: any,
  config: EditConfig
): any {
  const serializedFormData: any = {};

  Object.keys(formData).forEach((key) => {
    const field = config.sections
      .flatMap((s) => s.fields)
      .find((f) => f.name === key);

    const value = formData[key];

    if (value === "" || value === null || value === undefined) {
      return;
    }

    if (field?.type === "identifier_list") {
      const serialized = serializeIdentifierValue(value, field.type);
      if (serialized !== undefined) {
        serializedFormData[key] = serialized;
      }
    } else if (field?.type === "keywords") {
      const serialized = serializeKeywords(value);
      if (serialized !== undefined) {
        serializedFormData[key] = serialized;
      }
    } else if (field?.type === "text" && key.includes("Schema")) {
      const serialized = serializeIdentifierValue(value);
      if (serialized !== undefined) {
        serializedFormData[key] = serialized;
      }
    } else {
      serializedFormData[key] = value;
    }
  });

  return {
    "@context": metadata["@context"],
    "@type": metadata["@type"],
    ...serializedFormData,
    ...extraFields,
  };
}

export function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch {
    return dateString;
  }
}
