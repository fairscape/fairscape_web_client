import React from "react";

const FileInput = ({ property, onChange, error }) => {
  return (
    <input
      type="file"
      className={`form-control ${error ? "is-invalid" : ""}`}
      onChange={(e) => onChange(property.key, e.target.files[0])}
    />
  );
};

export default FileInput;
