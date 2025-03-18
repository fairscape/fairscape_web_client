import React, { useState, useEffect } from "react";
import "../forms/FormStyles.css";
import { createInitialData, createEmptyObject, renderField } from "./FormUtils";

// ListForm handles a form with a list of items and common fields
const ListForm = ({ schema, data, updateData }) => {
  // Initialize form data with schema defaults or provided data
  const [formData, setFormData] = useState(() => {
    if (data && Object.keys(data).length > 0) {
      return data;
    }
    return createInitialData(schema);
  });

  // Initialize common fields
  const [commonFields, setCommonFields] = useState(() => {
    if (schema.commonFields && data?.items?.length > 0) {
      const commonFieldData = {};
      schema.commonFields.forEach((field) => {
        commonFieldData[field] = data.items[0][field] || "";
      });
      return commonFieldData;
    } else if (schema.commonFields) {
      // Initialize with defaults if no data yet
      const commonFieldData = {};
      schema.commonFields.forEach((field) => {
        const fieldSchema = schema.properties.items.items.properties[field];
        commonFieldData[field] = fieldSchema.default || "";
      });
      return commonFieldData;
    }
    return {};
  });

  // Key to identify this specific form instance - prevents state confusion
  const [formKey] = useState(`form-${Math.random().toString(36).substr(2, 9)}`);

  // Update formData when data prop changes
  useEffect(() => {
    // Only update if data is defined and not an empty object
    if (data && Object.keys(data).length > 0) {
      setFormData(data);

      // Update common fields if applicable
      if (schema.commonFields && data.items?.length > 0) {
        const commonFieldData = {};
        schema.commonFields.forEach((field) => {
          commonFieldData[field] = data.items[0][field] || "";
        });
        setCommonFields(commonFieldData);
      }
    }
  }, [data, schema.commonFields]);

  // Handle changes to a simple field
  const handleInputChange = (e, path = []) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    // Handle different input types
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = value === "" ? null : parseFloat(value);
    }

    // Update the formData
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      // Navigate to the nested object
      for (let i = 0; i < path.length; i++) {
        if (current[path[i]] === undefined) {
          current[path[i]] = i === path.length - 1 ? {} : {};
        }
        current = current[path[i]];
      }

      // Update the field
      current[name] = newValue;
      return newData;
    });
  };

  // Handle changes to an array field (comma-separated values)
  const handleArrayChange = (e, path = []) => {
    const { name, value } = e.target;
    const arrayValue = value ? value.split(",").map((item) => item.trim()) : [];

    // Update the formData
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      // Navigate to the nested object
      for (let i = 0; i < path.length; i++) {
        if (current[path[i]] === undefined) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      // Update the field
      current[name] = arrayValue;
      return newData;
    });
  };

  // Handle changes to a common field (applies to all items in an array)
  const handleCommonFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    // Handle different input types
    if (type === "checkbox") {
      newValue = checked;
    } else if (type === "number") {
      newValue = value === "" ? null : parseFloat(value);
    }

    // Update common fields state
    setCommonFields((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Update the value in all items
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (newData.items && newData.items.length > 0) {
        newData.items = newData.items.map((item) => ({
          ...item,
          [name]: newValue,
        }));
      }
      return newData;
    });
  };

  // Handle changes to a common field that is an array (comma-separated)
  const handleCommonArrayChange = (e) => {
    const { name, value } = e.target;
    const arrayValue = value ? value.split(",").map((item) => item.trim()) : [];

    // Update common fields state
    setCommonFields((prev) => ({
      ...prev,
      [name]: arrayValue,
    }));

    // Update the value in all items
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (newData.items && newData.items.length > 0) {
        newData.items = newData.items.map((item) => ({
          ...item,
          [name]: arrayValue,
        }));
      }
      return newData;
    });
  };

  // Handle changes to a nested object field
  const handleObjectChange = (fieldName, key, value, path = []) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      // Navigate to the nested object
      for (let i = 0; i < path.length; i++) {
        if (current[path[i]] === undefined) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      // Update or create the nested object
      if (current[fieldName] === undefined) {
        current[fieldName] = {};
      }

      current[fieldName] = {
        ...current[fieldName],
        [key]: value,
      };

      return newData;
    });
  };

  // Add a new item to the items array
  const addItem = () => {
    setFormData((prevData) => {
      const newData = { ...prevData };

      // Create a new item with default values
      const newItem = createEmptyObject(
        schema.properties.items.items.properties
      );

      // Apply common fields
      if (schema.commonFields) {
        schema.commonFields.forEach((field) => {
          newItem[field] = commonFields[field] || "";
        });
      }

      // Add the new item to the array
      if (!Array.isArray(newData.items)) {
        newData.items = [];
      }
      newData.items.push(newItem);

      return newData;
    });
  };

  // Remove an item from the items array
  const removeItem = (index) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      if (!Array.isArray(newData.items)) return prevData;

      // Remove the item
      newData.items.splice(index, 1);
      return newData;
    });
  };

  // Add a new key-value pair to a dynamic object (like attributes)
  const addObjectProperty = (objectPath = [], defaultKey = "key") => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      // Navigate to the object
      for (let i = 0; i < objectPath.length; i++) {
        if (current[objectPath[i]] === undefined) {
          current[objectPath[i]] = {};
        }
        current = current[objectPath[i]];
      }

      // Generate a unique key
      let newKey = defaultKey;
      let counter = 1;
      while (current[newKey]) {
        newKey = `${defaultKey}_${counter}`;
        counter++;
      }

      // Add the new property
      current[newKey] = "";

      return newData;
    });
  };

  // Remove a key-value pair from a dynamic object
  const removeObjectProperty = (key, objectPath = []) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      // Navigate to the object
      for (let i = 0; i < objectPath.length; i++) {
        current = current[objectPath[i]];
        if (!current) return prevData;
      }

      // Remove the property
      delete current[key];

      return newData;
    });
  };

  // Update the key of a key-value pair in a dynamic object
  const updateObjectPropertyKey = (oldKey, newKey, objectPath = []) => {
    if (oldKey === newKey) return;

    setFormData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      // Navigate to the object
      for (let i = 0; i < objectPath.length; i++) {
        current = current[objectPath[i]];
        if (!current) return prevData;
      }

      // Make sure the new key is unique
      if (current[newKey]) return prevData;

      // Update the key
      const value = current[oldKey];
      delete current[oldKey];
      current[newKey] = value;

      return newData;
    });
  };

  // Update parent component when form data changes
  useEffect(() => {
    updateData(formData);
  }, [formData, updateData]);

  // Create handlers object to pass to renderField
  const handlers = {
    handleInputChange,
    handleArrayChange,
    handleCommonFieldChange,
    handleCommonArrayChange,
    handleObjectChange,
    addObjectProperty,
    removeObjectProperty,
    updateObjectPropertyKey,
    addItem,
    removeItem,
  };

  // Render common fields section
  const renderCommonFields = () => {
    if (!schema.commonFields || schema.commonFields.length === 0) {
      return null;
    }

    return (
      <div className="common-fields-section">
        <div className="section-header">
          <h3>Common Information</h3>
          <span className="section-badge">Applied to all items</span>
        </div>

        <div className="form-grid">
          {schema.commonFields.map((fieldName) => {
            const fieldSchema =
              schema.properties.items.items.properties[fieldName];
            const required =
              schema.properties.items.items.required?.includes(fieldName);

            return renderField({
              fieldName,
              fieldSchema,
              required,
              formData,
              handlers,
              commonFields,
              isCommonField: true,
            });
          })}
        </div>
      </div>
    );
  };

  // Render items list
  const renderItems = () => {
    const itemsSchema = schema.properties.items;
    const itemSchema = itemsSchema.items;

    // Ensure formData.items is an array
    const items = Array.isArray(formData.items) ? formData.items : [];

    return (
      <div>
        <div className="section-divider">
          <h3>{itemsSchema.title || "Items"}</h3>
          <p className="section-hint">{itemsSchema.description || ""}</p>
        </div>

        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={`${formKey}-item-${index}`} className="item-container">
              <div className="item-header">
                <h4>
                  {itemSchema.title ? itemSchema.title.slice(0, -1) : "Item"}{" "}
                  {index + 1}
                </h4>
                {items.length > 1 && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-grid">
                {Object.entries(itemSchema.properties)
                  .filter(
                    ([fieldName]) => !schema.commonFields?.includes(fieldName)
                  )
                  .map(([fieldName, fieldSchema]) => {
                    const required = itemSchema.required?.includes(fieldName);
                    return renderField({
                      fieldName,
                      fieldSchema,
                      path: ["items", index],
                      required,
                      formData,
                      handlers,
                    });
                  })}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-items-message">
            <p>No items added yet. Click the button below to add an item.</p>
          </div>
        )}

        <div className="button-group">
          <button type="button" className="add-button" onClick={addItem}>
            + Add {itemSchema.title ? itemSchema.title.slice(0, -1) : "Item"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="form-section" key={formKey}>
      <h2>{schema.title}</h2>
      <p className="form-description">{schema.description}</p>

      {/* Render common fields */}
      {renderCommonFields()}

      {/* Render items */}
      {renderItems()}
    </div>
  );
};

export default ListForm;
