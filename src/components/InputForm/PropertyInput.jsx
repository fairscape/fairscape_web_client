import React from "react";

const PropertyInput = ({ property, value, onChange, error }) => {
  const nestedProperty = value || {
    name: "",
    description: "",
    type: "",
    index: "",
    value_url: "",
  };

  return (
    <div className="nested-nested-property-box p-3 border rounded mb-3">
      {["name", "description", "type", "index", "value_url"].map(
        (nestedKey) => (
          <div key={nestedKey} className="mb-3">
            <label className="form-label">
              {nestedKey.charAt(0).toUpperCase() +
                nestedKey.slice(1).replace("_", " ")}
            </label>
            <input
              type="text"
              className={`form-control ${error ? "is-invalid" : ""}`}
              value={nestedProperty[nestedKey] || ""}
              onChange={(e) =>
                onChange(property.key, nestedKey, e.target.value)
              }
            />
          </div>
        )
      )}
    </div>
  );
};

export default PropertyInput;
