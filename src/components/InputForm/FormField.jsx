import React from "react";
import TextInput from "./TextInput";
import FileInput from "./FileInput";
import ListInput from "./ListInput";
import PropertyInput from "./PropertyInput";

const FormField = ({ property, formState }) => {
  const {
    formData,
    errors,
    handleChange,
    handleFileChange,
    handleListChange,
    handlePropertyChange,
    handleListPropertyChange,
    addListItem,
    removeListItem,
  } = formState;

  const renderInput = () => {
    switch (property.type) {
      case "file":
        return (
          <FileInput
            property={property}
            onChange={handleFileChange}
            error={errors[property.key]}
          />
        );
      case "property":
        return (
          <PropertyInput
            property={property}
            value={formData[property.key]}
            onChange={handlePropertyChange}
            error={errors[property.key]}
          />
        );
      default:
        if (property.type.startsWith("list")) {
          return (
            <ListInput
              property={property}
              value={formData[property.key] || []}
              onChange={
                property.type.includes("property")
                  ? handleListPropertyChange
                  : handleListChange
              }
              onAdd={() => addListItem(property.key)}
              onRemove={(index) => removeListItem(property.key, index)}
              error={errors[property.key]}
            />
          );
        }
        return (
          <TextInput
            property={property}
            value={formData[property.key]}
            onChange={handleChange}
            error={errors[property.key]}
          />
        );
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">{property.name}</label>
      {renderInput()}
      {errors[property.key] && (
        <div className="invalid-feedback">This field is required.</div>
      )}
    </div>
  );
};

export default FormField;
