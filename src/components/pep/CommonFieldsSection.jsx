import React from "react";

const CommonFieldsSection = ({
  title,
  badgeText,
  fields,
  fieldValues,
  sectionKey,
  handleInputChange,
}) => {
  return (
    <div className="section">
      <div className="section-header">
        <h3>{title}</h3>
        <span className="section-badge">{badgeText}</span>
      </div>
      <div className="form-fields">
        {Object.keys(fields).map((field) => (
          <div key={field} className="form-group">
            <label htmlFor={`common-${sectionKey}-${field}`}>
              {field.replace(/_/g, " ")}
            </label>
            <input
              id={`common-${sectionKey}-${field}`}
              type="text"
              value={fieldValues[field] || ""}
              onChange={(e) =>
                handleInputChange(sectionKey, field, e.target.value)
              }
            />
            {fields[field]?.description && (
              <p className="field-description">{fields[field].description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommonFieldsSection;
