export const getUniqueFields = (schemaProperties, fullSchema) => {
  const uniqueFields = {};

  if (schemaProperties) {
    Object.keys(schemaProperties).forEach((field) => {
      if (schemaProperties[field].unique === true) {
        uniqueFields[field] = schemaProperties[field];
      }
    });
  }

  // Always include required fields in unique fields
  if (schemaProperties && fullSchema) {
    Object.keys(schemaProperties).forEach((field) => {
      if (
        fullSchema.properties.samples.items.required?.includes(field) ||
        fullSchema.properties.subsamples.items.required?.includes(field)
      ) {
        uniqueFields[field] = schemaProperties[field];
      }
    });
  }

  return uniqueFields;
};

// Get common fields (fields that are not unique)
export const getCommonFields = (schemaProperties, uniqueFields) => {
  const commonFields = {};

  if (schemaProperties) {
    Object.keys(schemaProperties).forEach((field) => {
      if (!uniqueFields[field]) {
        commonFields[field] = schemaProperties[field];
      }
    });
  }

  return commonFields;
};

// Create an empty item based on schema properties
export const createEmptyItem = (schemaProperties) => {
  const emptyItem = {};

  // Initialize all fields defined in the schema with empty strings
  if (schemaProperties) {
    Object.keys(schemaProperties).forEach((field) => {
      emptyItem[field] = "";
    });
  }

  return emptyItem;
};
