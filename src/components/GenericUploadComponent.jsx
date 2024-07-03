import React from "react";
import { useFormState } from "./InputForm/useFormState";
import FormField from "./InputForm/FormField";
import getPropertyList from "./InputForm/uploadProperties";
import "./GenericUploadComponent.css";

const initializeFormData = (properties) => {
  const initialData = {};
  properties.forEach((property) => {
    if (property.type.startsWith("list")) {
      initialData[property.key] = [];
    } else if (property.type === "file") {
      initialData[property.key] = null;
    } else if (property.type === "property") {
      initialData[property.key] = {
        name: "",
        description: "",
        type: "",
        index: "",
        value_url: "",
      };
    } else {
      initialData[property.key] = "";
    }
  });
  return initialData;
};

const GenericUploadComponent = ({ type }) => {
  const properties = getPropertyList(type);
  const initialFormData = initializeFormData(properties);
  const formState = useFormState(initialFormData, properties);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = {};
    properties.forEach((property) => {
      if (property.required) {
        if (property.type.startsWith("list")) {
          newErrors[property.key] =
            formState.formData[property.key].length === 0 ||
            formState.formData[property.key].some((item) =>
              typeof item === "object"
                ? Object.values(item).some((val) => val === "")
                : item === ""
            );
        } else if (property.type === "file") {
          newErrors[property.key] = !formState.formData[property.key];
        } else if (property.type === "property") {
          newErrors[property.key] = Object.values(formState.formData[property.key]).some(
            (item) => item === ""
          );
        } else {
          newErrors[property.key] = formState.formData[property.key] === "";
        }
      }
    });
    formState.setErrors(newErrors);
    if (Object.keys(newErrors).filter((key) => newErrors[key]).length === 0) {
      console.log("Form submitted successfully with data:", formState.formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container">
      {properties.map((property) => (
        <FormField key={property.key} property={property} formState={formState} />
      ))}
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default GenericUploadComponent;