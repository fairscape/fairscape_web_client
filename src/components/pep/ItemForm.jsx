import React from "react";

const ItemForm = ({
  item,
  index,
  uniqueFields,
  schemaPath,
  schema,
  sectionKey,
  handleInputChange,
  removeItem,
  itemName,
  showRemoveButton,
}) => {
  return (
    <div className={`${sectionKey.slice(0, -1)}-container`}>
      <div className="item-header">
        <h4>
          {itemName} {index + 1}
        </h4>
        {showRemoveButton && (
          <button
            type="button"
            className="remove-button button-with-icon"
            onClick={() => removeItem(sectionKey, index)}
          >
            ✕ Remove
          </button>
        )}
      </div>
      <div className="form-fields">
        {Object.keys(uniqueFields).map((field) => (
          <div key={field} className="form-group">
            <label htmlFor={`${sectionKey}-${index}-${field}`}>
              {field.replace(/_/g, " ")}
              {schema.properties[schemaPath].items.required?.includes(
                field
              ) && <span className="required">*</span>}
            </label>
            <input
              id={`${sectionKey}-${index}-${field}`}
              type="text"
              value={item[field] || ""}
              onChange={(e) =>
                handleInputChange(sectionKey, index, field, e.target.value)
              }
              required={schema.properties[schemaPath].items.required?.includes(
                field
              )}
            />
            {uniqueFields[field]?.description && (
              <p className="field-description">
                {uniqueFields[field].description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemForm;
