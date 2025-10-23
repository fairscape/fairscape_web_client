export const parseMetadataToForm = (metadata: any, config: any): any => {
  const formData: any = {};

  if (!config || !config.sections) {
    return formData;
  }

  config.sections.forEach((section: any) => {
    section.fields?.forEach((field: any) => {
      const value = metadata[field.name];
      if (value !== undefined) {
        formData[field.name] = value;
      } else {
        formData[field.name] = field.type === "array" ? [] : "";
      }
    });
  });

  return formData;
};

export const extractExtraFields = (metadata: any, config: any): any => {
  const extraFields: any = {};
  const knownFields = new Set<string>();

  if (config && config.sections) {
    config.sections.forEach((section: any) => {
      section.fields?.forEach((field: any) => {
        knownFields.add(field.name);
      });
    });
  }

  Object.keys(metadata).forEach((key) => {
    if (!knownFields.has(key) && !key.startsWith("@")) {
      extraFields[key] = metadata[key];
    }
  });

  return extraFields;
};

export const generateUpdatePayload = (
  formData: any,
  extraFields: any,
  originalMetadata: any,
  config: any
): any => {
  const payload: any = {
    ...originalMetadata,
  };

  if (config && config.sections) {
    config.sections.forEach((section: any) => {
      section.fields?.forEach((field: any) => {
        const value = formData[field.name];
        if (value !== undefined && value !== null && value !== "") {
          payload[field.name] = value;
        } else {
          delete payload[field.name];
        }
      });
    });
  }

  Object.keys(extraFields).forEach((key) => {
    payload[key] = extraFields[key];
  });

  return payload;
};

export const filterFieldsByVisibility = (
  config: any,
  visibility: "minimal" | "ai-ready" | "all"
): any => {
  if (visibility === "all" || !config.sections) {
    return config;
  }

  const filteredConfig = { ...config };
  filteredConfig.sections = config.sections
    .map((section: any) => {
      const filteredSection = { ...section };

      if (visibility === "minimal") {
        filteredSection.fields = section.fields?.filter(
          (field: any) => field.required
        );
      } else if (visibility === "ai-ready") {
        filteredSection.fields = section.fields?.filter(
          (field: any) => field.aiReady
        );
      }

      return filteredSection;
    })
    .filter((section: any) => section.fields && section.fields.length > 0);

  return filteredConfig;
};

export const isFieldEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
};

export const initializeReviewStates = (
  llmPopulatedFields: Set<string>,
  formData: any,
  config: any
): any => {
  const reviewStates: any = {};

  llmPopulatedFields.forEach((fieldName) => {
    const field = findFieldInConfig(fieldName, config);
    if (field?.reviewRequired !== false) {
      reviewStates[fieldName] = {
        fieldName,
        status: "pending",
        originalValue: null,
        llmValue: formData[fieldName],
        timestamp: Date.now(),
      };
    }
  });

  return reviewStates;
};

const findFieldInConfig = (fieldName: string, config: any): any => {
  if (!config.sections) return null;

  for (const section of config.sections) {
    const field = section.fields?.find((f: any) => f.name === fieldName);
    if (field) return field;
  }

  return null;
};
