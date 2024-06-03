import React from "react";

const TableRow = ({ property, value }) => {
  const renderValue = (value) => {
    if (Array.isArray(value)) {
      if (typeof value[0] === "object") {
        return (
          <div
            className="accordion"
            id={`accordion${property.replace(" ", "-")}`}
          >
            {value.map((item, index) => (
              <div className="accordion-item" key={index}>
                <h2
                  className="accordion-header"
                  id={`heading${property.replace(" ", "-")}-${index}`}
                >
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${property.replace(
                      " ",
                      "-"
                    )}-${index}`}
                    aria-expanded="true"
                    aria-controls={`collapse${property.replace(
                      " ",
                      "-"
                    )}-${index}`}
                  >
                    {item.name || `Item ${index + 1}`}
                  </button>
                </h2>
                <div
                  id={`collapse${property.replace(" ", "-")}-${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading${property.replace(
                    " ",
                    "-"
                  )}-${index}`}
                  data-bs-parent={`#accordion${property.replace(" ", "-")}`}
                >
                  <div className="accordion-body">
                    {Object.keys(item).map((key) => (
                      <div key={key}>
                        <strong>{key}:</strong> {item[key]}
                        <br />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      }
      return (
        <ul>
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    return value;
  };

  return (
    <tr>
      <td>{property}</td>
      <td>{renderValue(value)}</td>
    </tr>
  );
};

export default TableRow;
