import React from "react";

const SimpleTableRowComponent = ({ property, value }) => {
  const renderValue = (val) => {
    if (Array.isArray(val)) {
      return (
        <ul>
          {val.map((item, index) => (
            <li key={index}>{renderValue(item)}</li>
          ))}
        </ul>
      );
    } else if (typeof val === "object" && val !== null) {
      return (
        <ul>
          {Object.entries(val).map(([key, nestedVal], index) => (
            <li key={index}>
              <strong>{key}: </strong>
              {renderValue(nestedVal)}
            </li>
          ))}
        </ul>
      );
    }
    return val;
  };

  return (
    <tr>
      <td>{property}</td>
      <td>{renderValue(value)}</td>
    </tr>
  );
};

export default SimpleTableRowComponent;
