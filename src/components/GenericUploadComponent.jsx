import React, { useState } from "react";
import getPropertyList from "./uploadProperties";

const GenericUploadComponent = ({ type }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const properties = getPropertyList(type);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setErrors({
      ...errors,
      [key]: !value && properties.find((prop) => prop.key === key).required,
    });
  };

  const handleFileChange = (key, file) => {
    setFormData({ ...formData, [key]: file });
    setErrors({
      ...errors,
      [key]: !file && properties.find((prop) => prop.key === key).required,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = {};
    properties.forEach((property) => {
      if (property.required && !formData[property.key]) {
        newErrors[property.key] = true;
      }
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Handle form submission, e.g., send formData to an API
      console.log("Form submitted successfully with data:", formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container">
      {properties.map((property) => (
        <div key={property.key} className="mb-3">
          <label className="form-label">{property.name}</label>
          {property.type === "file" ? (
            <input
              type="file"
              className={`form-control ${
                errors[property.key] ? "is-invalid" : ""
              }`}
              onChange={(e) =>
                handleFileChange(property.key, e.target.files[0])
              }
            />
          ) : (
            <input
              type={property.type}
              className={`form-control ${
                errors[property.key] ? "is-invalid" : ""
              }`}
              onChange={(e) => handleChange(property.key, e.target.value)}
            />
          )}
          {errors[property.key] && (
            <div className="invalid-feedback">This field is required.</div>
          )}
        </div>
      ))}
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default GenericUploadComponent;
