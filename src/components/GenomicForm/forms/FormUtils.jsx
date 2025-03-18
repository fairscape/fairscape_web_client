// Utility functions for form components
import React from "react";

// Create initial data structure based on schema
export function createInitialData(schema) {
  if (schema.properties.items && schema.properties.items.type === "array") {
    // Create empty array for items - we'll add items with the Add button
    return {
      items: [],
    };
  } else {
    // Otherwise create an object with all properties defined in the schema
    return createEmptyObject(schema.properties);
  }
}

// Create an object with the structure defined by properties
export function createEmptyObject(properties) {
  const obj = {};
  Object.keys(properties).forEach((key) => {
    const prop = properties[key];

    if (prop.type === "string") {
      obj[key] = prop.default || "";
    } else if (prop.type === "number") {
      obj[key] = prop.default !== undefined ? prop.default : null;
    } else if (prop.type === "boolean") {
      obj[key] = prop.default || false;
    } else if (prop.type === "array") {
      if (prop.default) {
        obj[key] = [...prop.default];
      } else if (prop.format === "comma-separated") {
        obj[key] = [];
      } else {
        obj[key] = [];
      }
    } else if (prop.type === "object") {
      if (prop.additionalProperties) {
        obj[key] = {}; // For objects with dynamic properties like attributes
      } else if (prop.properties) {
        obj[key] = createEmptyObject(prop.properties);
      } else {
        obj[key] = {};
      }
    }
  });
  return obj;
}

// Get value from nested object safely
export function getNestedValue(obj, path, fieldName) {
  let current = obj;

  for (const pathPart of path) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[pathPart];
  }

  return current ? current[fieldName] : undefined;
}

// Render a form field based on its schema
export function renderField({
  fieldName,
  fieldSchema,
  path = [],
  required = false,
  formData,
  handlers,
  commonFields = {},
  isCommonField = false,
}) {
  // Skip items array schema (handled separately)
  if (fieldName === "items" && fieldSchema.type === "array") {
    return null;
  }

  // Get the current value safely
  const value = isCommonField
    ? commonFields[fieldName]
    : getNestedValue(formData, path, fieldName);

  const fieldId = path.length ? `${path.join("-")}-${fieldName}` : fieldName;
  const handleChange = isCommonField
    ? handlers.handleCommonFieldChange
    : handlers.handleInputChange;

  switch (fieldSchema.type) {
    case "string":
      if (fieldSchema.enum) {
        // Enum (dropdown)
        return (
          <div className="form-group" key={fieldId}>
            <label htmlFor={fieldId}>
              {fieldSchema.title || fieldName}
              {required && <span className="required">*</span>}
            </label>
            <select
              id={fieldId}
              name={fieldName}
              value={value || ""}
              onChange={(e) =>
                isCommonField ? handleChange(e) : handleChange(e, path)
              }
              required={required}
            >
              <option value="">Select {fieldSchema.title || fieldName}</option>
              {fieldSchema.enum.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldSchema.description && (
              <p className="field-hint">{fieldSchema.description}</p>
            )}
          </div>
        );
      } else if (fieldSchema.format === "textarea") {
        // Textarea
        return (
          <div className="form-group full-width" key={fieldId}>
            <label htmlFor={fieldId}>
              {fieldSchema.title || fieldName}
              {required && <span className="required">*</span>}
            </label>
            <textarea
              id={fieldId}
              name={fieldName}
              value={value || ""}
              onChange={(e) =>
                isCommonField ? handleChange(e) : handleChange(e, path)
              }
              required={required}
              rows={4}
            ></textarea>
            {fieldSchema.description && (
              <p className="field-hint">{fieldSchema.description}</p>
            )}
          </div>
        );
      } else if (fieldSchema.format === "date") {
        // Date input
        return (
          <div className="form-group" key={fieldId}>
            <label htmlFor={fieldId}>
              {fieldSchema.title || fieldName}
              {required && <span className="required">*</span>}
            </label>
            <input
              type="date"
              id={fieldId}
              name={fieldName}
              value={value || ""}
              onChange={(e) =>
                isCommonField ? handleChange(e) : handleChange(e, path)
              }
              required={required}
            />
            {fieldSchema.description && (
              <p className="field-hint">{fieldSchema.description}</p>
            )}
          </div>
        );
      } else {
        // Regular text input
        return (
          <div className="form-group" key={fieldId}>
            <label htmlFor={fieldId}>
              {fieldSchema.title || fieldName}
              {required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              id={fieldId}
              name={fieldName}
              value={value || ""}
              onChange={(e) =>
                isCommonField ? handleChange(e) : handleChange(e, path)
              }
              required={required}
            />
            {fieldSchema.description && (
              <p className="field-hint">{fieldSchema.description}</p>
            )}
          </div>
        );
      }

    case "number":
      // Number input
      return (
        <div className="form-group" key={fieldId}>
          <label htmlFor={fieldId}>
            {fieldSchema.title || fieldName}
            {required && <span className="required">*</span>}
          </label>
          <input
            type="number"
            id={fieldId}
            name={fieldName}
            value={value === null || value === undefined ? "" : value}
            onChange={(e) =>
              isCommonField ? handleChange(e) : handleChange(e, path)
            }
            required={required}
          />
          {fieldSchema.description && (
            <p className="field-hint">{fieldSchema.description}</p>
          )}
        </div>
      );

    case "boolean":
      // Checkbox
      return (
        <div className="form-group checkbox-group" key={fieldId}>
          <label htmlFor={fieldId}>
            <input
              type="checkbox"
              id={fieldId}
              name={fieldName}
              checked={value || false}
              onChange={(e) =>
                isCommonField ? handleChange(e) : handleChange(e, path)
              }
              required={required}
            />
            {fieldSchema.title || fieldName}
            {required && <span className="required">*</span>}
          </label>
          {fieldSchema.description && (
            <p className="field-hint">{fieldSchema.description}</p>
          )}
        </div>
      );

    case "array":
      if (fieldSchema.format === "comma-separated") {
        // Array as comma-separated values
        const arrayValue = Array.isArray(value) ? value.join(", ") : "";
        return (
          <div className="form-group" key={fieldId}>
            <label htmlFor={fieldId}>
              {fieldSchema.title || fieldName}
              {required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              id={fieldId}
              name={fieldName}
              value={arrayValue}
              onChange={(e) =>
                isCommonField
                  ? handlers.handleCommonArrayChange(e)
                  : handlers.handleArrayChange(e, path)
              }
              placeholder="Enter values separated by commas"
              required={required}
            />
            {fieldSchema.description && (
              <p className="field-hint">{fieldSchema.description}</p>
            )}
          </div>
        );
      } else if (fieldSchema.items && fieldSchema.items.type === "object") {
        // Array of objects (nested items)
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <div className="nested-items-section" key={fieldId}>
            <div className="section-subheader">
              <h5>{fieldSchema.title || fieldName}</h5>
              {fieldSchema.description && (
                <p className="section-hint">{fieldSchema.description}</p>
              )}
            </div>

            {arrayValue.map((item, index) => (
              <div key={index} className="nested-item-container">
                <div className="nested-item-header">
                  <h6>{fieldSchema.items.title || `Item ${index + 1}`}</h6>
                  {arrayValue.length > 1 && (
                    <button
                      type="button"
                      className="remove-button-small"
                      onClick={() =>
                        handlers.removeItem(index, [...path, fieldName])
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  {Object.entries(fieldSchema.items.properties).map(
                    ([itemFieldName, itemFieldSchema]) => {
                      const itemRequired =
                        fieldSchema.items.required?.includes(itemFieldName);
                      return renderField({
                        fieldName: itemFieldName,
                        fieldSchema: itemFieldSchema,
                        path: [...path, fieldName, index],
                        required: itemRequired,
                        formData,
                        handlers,
                      });
                    }
                  )}
                </div>
              </div>
            ))}

            <div className="button-group-small">
              <button
                type="button"
                className="add-button-small"
                onClick={() => handlers.addItem([...path, fieldName])}
              >
                + Add {fieldSchema.items.title || "Item"}
              </button>
            </div>
          </div>
        );
      }
      break;

    case "object":
      if (fieldSchema.additionalProperties) {
        // Dynamic key-value object (like attributes)
        const objectValue = value || {};
        return (
          <div className="dynamic-object-section" key={fieldId}>
            <div className="section-subheader">
              <h5>{fieldSchema.title || fieldName}</h5>
              {fieldSchema.description && (
                <p className="section-hint">{fieldSchema.description}</p>
              )}
            </div>

            {Object.entries(objectValue).map(([key, propValue], index) => (
              <div key={index} className="attribute-row">
                <div className="form-group">
                  <label>Key</label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) =>
                      handlers.updateObjectPropertyKey(key, e.target.value, [
                        ...path,
                        fieldName,
                      ])
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Value</label>
                  <input
                    type="text"
                    value={propValue || ""}
                    onChange={(e) =>
                      handlers.handleObjectChange(
                        fieldName,
                        key,
                        e.target.value,
                        path
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  className="remove-attribute-button"
                  onClick={() =>
                    handlers.removeObjectProperty(key, [...path, fieldName])
                  }
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              className="add-attribute-button"
              onClick={() => handlers.addObjectProperty([...path, fieldName])}
            >
              + Add Property
            </button>
          </div>
        );
      } else {
        // Regular object with defined properties
        return (
          <div className="object-section" key={fieldId}>
            <div className="section-subheader">
              <h5>{fieldSchema.title || fieldName}</h5>
              {fieldSchema.description && (
                <p className="section-hint">{fieldSchema.description}</p>
              )}
            </div>

            <div className="form-grid">
              {Object.entries(fieldSchema.properties || {}).map(
                ([subFieldName, subFieldSchema]) => {
                  const subFieldRequired =
                    fieldSchema.required?.includes(subFieldName);
                  return renderField({
                    fieldName: subFieldName,
                    fieldSchema: subFieldSchema,
                    path: [...path, fieldName],
                    required: subFieldRequired,
                    formData,
                    handlers,
                  });
                }
              )}
            </div>
          </div>
        );
      }
      break;

    default:
      return null;
  }
}
