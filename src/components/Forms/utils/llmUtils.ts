import {
  ReviewStatus,
  FieldReviewState,
  ReviewStates,
} from "../types/reviewTypes";

export const isFieldEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
};

export const getEmptyFields = (formData: any, config: any): string[] => {
  const emptyFields: string[] = [];

  if (!config.sections) return emptyFields;

  config.sections.forEach((section: any) => {
    section.fields?.forEach((field: any) => {
      if (field.llmExtractable && isFieldEmpty(formData[field.name])) {
        emptyFields.push(field.name);
      }
    });
  });

  return emptyFields;
};

export const processLLMResponse = (
  llmResponse: any,
  formData: any,
  config: any,
): {
  updatedFormData: any;
  reviewStates: ReviewStates;
  populatedFields: Set<string>;
} => {
  const updatedFormData = { ...formData };
  const reviewStates: ReviewStates = {};
  const populatedFields = new Set<string>();

  const suggestions = llmResponse.suggestions || llmResponse;

  Object.keys(suggestions).forEach((fieldName) => {
    if (isFieldEmpty(formData[fieldName])) {
      const field = findFieldInConfig(fieldName, config);

      updatedFormData[fieldName] = suggestions[fieldName];
      populatedFields.add(fieldName);

      if (field?.reviewRequired !== false) {
        reviewStates[fieldName] = {
          fieldName,
          status: ReviewStatus.Pending,
          originalValue: formData[fieldName],
          llmValue: suggestions[fieldName],
          timestamp: Date.now(),
        };
      }
    }
  });

  return { updatedFormData, reviewStates, populatedFields };
};

export const mergeLLMSuggestionsForEdit = (
  llmSuggestions: any,
  existingFormData: any,
): any => {
  const mergedData = { ...existingFormData };

  Object.keys(llmSuggestions).forEach((key) => {
    if (isFieldEmpty(existingFormData[key])) {
      mergedData[key] = llmSuggestions[key];
    }
  });

  return mergedData;
};

export const findFieldInConfig = (fieldName: string, config: any): any => {
  if (!config.sections) return null;

  for (const section of config.sections) {
    const field = section.fields?.find((f: any) => f.name === fieldName);
    if (field) return field;
  }

  return null;
};

export const validateLLMSuggestions = (
  suggestions: any,
  config: any,
): boolean => {
  if (!suggestions || typeof suggestions !== "object") return false;

  for (const fieldName in suggestions) {
    const field = findFieldInConfig(fieldName, config);
    if (!field) continue;

    const value = suggestions[fieldName];

    if (field.type === "array" && !Array.isArray(value)) {
      return false;
    }

    if (field.type === "number" && typeof value !== "number") {
      return false;
    }
  }

  return true;
};

export const mergeWithReviewStatus = (
  currentReviewStates: ReviewStates,
  newReviewStates: ReviewStates,
): ReviewStates => {
  return {
    ...currentReviewStates,
    ...newReviewStates,
  };
};

export const getReviewProgress = (
  reviewStates: ReviewStates,
): { reviewed: number; total: number } => {
  const total = Object.keys(reviewStates).length;
  const reviewed = Object.values(reviewStates).filter(
    (state) => state.status !== ReviewStatus.Pending,
  ).length;

  return { reviewed, total };
};

export const hasUnreviewedFields = (reviewStates: ReviewStates): boolean => {
  return Object.values(reviewStates).some(
    (state) => state.status === ReviewStatus.Pending,
  );
};

export const filterFieldsByVisibility = (
  config: any,
  visibility: "minimal" | "ai-ready" | "all",
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
          (field: any) => field.required,
        );
      } else if (visibility === "ai-ready") {
        filteredSection.fields = section.fields?.filter(
          (field: any) => field.aiReady,
        );
      }

      return filteredSection;
    })
    .filter((section: any) => section.fields && section.fields.length > 0);

  return filteredConfig;
};

export const initializeReviewStates = (
  llmPopulatedFields: Set<string>,
  formData: any,
  config: any,
): ReviewStates => {
  const reviewStates: ReviewStates = {};

  llmPopulatedFields.forEach((fieldName) => {
    const field = findFieldInConfig(fieldName, config);
    if (field?.reviewRequired !== false) {
      reviewStates[fieldName] = {
        fieldName,
        status: ReviewStatus.Pending,
        originalValue: null,
        llmValue: formData[fieldName],
        timestamp: Date.now(),
      };
    }
  });

  return reviewStates;
};
