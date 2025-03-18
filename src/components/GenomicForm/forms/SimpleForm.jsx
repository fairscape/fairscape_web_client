import React, { useState, useEffect } from "react";
import "./FormStyles.css";
import { createInitialData, renderField } from "./FormUtils";

// SimpleForm handles a basic form with a single object
const SimpleForm = ({ schema, data, updateData }) => {
  // Initialize form data with schema defaults or provided data
  const [formData, setFormData] = useState(() => {
    if (data) return data;
    return createInitialData(schema);
  });

  // Update formData when data prop changes
  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

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

  // Add a new item to an array
  const addItem = (arrayPath = []) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      // Navigate to the array
      for (let i = 0; i < arrayPath.length; i++) {
        if (current[arrayPath[i]] === undefined) {
          current[arrayPath[i]] = [];
        }
        current = current[arrayPath[i]];
      }

      // Get the schema for the array items
      let itemsSchema = schema;
      for (const pathPart of [...arrayPath, "items"]) {
        itemsSchema = itemsSchema.properties?.[pathPart] || itemsSchema;
      }

      // Create a new item with default values (for nested arrays only)
      const newItem = {};

      // Add the new item to the array
      if (!Array.isArray(current)) {
        current = [];
      }
      current.push(newItem);

      return newData;
    });
  };

  // Remove an item from an array
  const removeItem = (index, arrayPath = []) => {
    setFormData((prevData) => {
      const newData = { ...prevData };
      let current = newData;

      // Navigate to the array
      for (let i = 0; i < arrayPath.length; i++) {
        current = current[arrayPath[i]];
        if (!current) return prevData;
      }

      if (!Array.isArray(current)) return prevData;

      // Remove the item
      current.splice(index, 1);

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
    handleObjectChange,
    addObjectProperty,
    removeObjectProperty,
    updateObjectPropertyKey,
    addItem,
    removeItem,
  };

  return (
    <div className="form-section">
      <h2>{schema.title}</h2>
      <p className="form-description">{schema.description}</p>

      <div className="form-grid">
        {Object.entries(schema.properties).map(([fieldName, fieldSchema]) => {
          const required = schema.required?.includes(fieldName);
          return renderField({
            fieldName,
            fieldSchema,
            path: [],
            required,
            formData,
            handlers,
          });
        })}
      </div>
    </div>
  );
};

export default SimpleForm;
