import { useState } from "react";

export const useFormState = (initialState, properties) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({
      ...prev,
      [key]:
        value === "" && properties.find((prop) => prop.key === key).required,
    }));
  };

  const handleFileChange = (key, file) => {
    setFormData((prev) => ({ ...prev, [key]: file }));
    setErrors((prev) => ({
      ...prev,
      [key]: !file && properties.find((prop) => prop.key === key).required,
    }));
  };

  const handleListChange = (key, index, value) => {
    setFormData((prev) => {
      const list = [...(prev[key] || [])];
      list[index] = value;
      return { ...prev, [key]: list };
    });
    setErrors((prev) => ({
      ...prev,
      [key]:
        formData[key].some((item) => item === "") &&
        properties.find((prop) => prop.key === key).required,
    }));
  };

  const handlePropertyChange = (parentKey, key, value) => {
    setFormData((prev) => {
      const nestedProperty = { ...(prev[parentKey] || {}) };
      nestedProperty[key] = value;
      return { ...prev, [parentKey]: nestedProperty };
    });
  };

  const handleListPropertyChange = (key, index, nestedKey, value) => {
    setFormData((prev) => {
      const list = [...(prev[key] || [])];
      list[index] = { ...list[index], [nestedKey]: value };
      return { ...prev, [key]: list };
    });
  };

  const addListItem = (key) => {
    setFormData((prev) => {
      const isPropertyType = properties
        .find((prop) => prop.key === key)
        ?.type.startsWith("list:property");
      const newItem = isPropertyType
        ? {
            name: "",
            description: "",
            type: "",
            index: "",
            value_url: "",
          }
        : "";
      return {
        ...prev,
        [key]: [...(prev[key] || []), newItem],
      };
    });
  };

  const removeListItem = (key, index) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  return {
    formData,
    errors,
    handleChange,
    handleFileChange,
    handleListChange,
    handlePropertyChange,
    handleListPropertyChange,
    addListItem,
    removeListItem,
    setErrors,
  };
};
