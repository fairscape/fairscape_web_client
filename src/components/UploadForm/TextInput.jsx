import React from "react";

const TextInput = ({ property, value, onChange, error }) => {
  return (
    <input
      type={property.type}
      className={`form-control ${error ? "is-invalid" : ""}`}
      value={value || ""}
      onChange={(e) => onChange(property.key, e.target.value)}
    />
  );
};

export default TextInput;
