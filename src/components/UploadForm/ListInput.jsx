import React from "react";
import TextInput from "./TextInput";
import PropertyInput from "./PropertyInput";

const ListInput = ({ property, value, onChange, onAdd, onRemove, error }) => {
  const renderListItem = (item, index) => {
    const listType = property.type.split(":")[1];
    if (listType === "property") {
      return (
        <PropertyInput
          property={{ ...property, type: "property" }}
          value={item}
          onChange={(_, key, val) => onChange(property.key, index, key, val)}
          error={error}
        />
      );
    } 
    else {
      return (
        <TextInput
          property={{ ...property, type: listType }}
          value={item}
          onChange={(_, val) => onChange(property.key, index, val)}
          error={error}
        />
      );
    }
  };

  return (
    <div className="nested-property-box">
      {value.map((item, index) => (
        <div key={index} className="mb-3 d-flex align-items-center">
          <div className="flex-grow-1">{renderListItem(item, index)}</div>
          <button
            type="button"
            className="btn btn-danger ml-3"
            onClick={() => onRemove(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-primary mt-2" onClick={onAdd}>
        Add {property.name}
      </button>
    </div>
  );
};

export default ListInput;
