import React from "react";
import ItemForm from "./ItemForm";

const ItemsSection = ({
  title,
  badgeText,
  uniqueFields,
  items,
  schema,
  schemaPath,
  sectionKey,
  handleInputChange,
  addItem,
  removeItem,
  itemName,
}) => {
  return (
    <div className="section">
      <div className="section-header">
        <h3>{title}</h3>
        <span className="section-badge">{badgeText}</span>
      </div>

      <div className="items-container">
        {items.map((item, index) => (
          <ItemForm
            key={index}
            item={item}
            index={index}
            uniqueFields={uniqueFields}
            schemaPath={schemaPath}
            schema={schema}
            sectionKey={sectionKey}
            handleInputChange={handleInputChange}
            removeItem={removeItem}
            itemName={itemName}
            showRemoveButton={items.length > 1}
          />
        ))}
      </div>
      <div className="button-group">
        <input
          id={`${sectionKey}-csv-upload`}
          type="file"
          accept=".csv"
          className="csv-upload-input"
          style={{ display: "none" }}
        />
        <label
          htmlFor={`${sectionKey}-csv-upload`}
          className="csv-upload-button button-with-icon"
        >
          📄 Upload CSV
        </label>
        <button
          type="button"
          className="add-button button-with-icon"
          onClick={() => addItem(sectionKey)}
        >
          + Add {itemName}
        </button>
      </div>
    </div>
  );
};

export default ItemsSection;
