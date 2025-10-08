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

export function parseMetadataToForm(metadata: any, config: EditConfig): any {
  const formData: any = {};
  const configFields = getAllConfigFieldNames(config);

  configFields.forEach((fieldName) => {
    if (metadata[fieldName] !== undefined) {
      formData[fieldName] = metadata[fieldName];
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

export function generateUpdatePayload(
  formData: any,
  extraFields: any,
  metadata: any
): any {
  return {
    "@context": metadata["@context"],
    "@type": metadata["@type"],
    ...formData,
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
