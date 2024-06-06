import React, { useState } from "react";

const FAIRSCAPE_URL = "http://example.com/"; // Replace with your actual URL
const urlPattern = /^(http|https):\/\/[^\s]+/;
const identifierPattern = /^ark:[0-9]{5}\/.*$/;

const addLink = (value, download = false) => {
  if (download) {
    return (
      <a href={`${FAIRSCAPE_URL}rocrate/archived/download/${value}`}>
        Download Link
      </a>
    );
  } else if (identifierPattern.test(value)) {
    return <a href={`${FAIRSCAPE_URL}${value}`}>{value}</a>;
  } else if (urlPattern.test(value)) {
    return <a href={value}>{value}</a>;
  }
  return value;
};

const TableRow = ({ property, value }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderValue = (value, keyPrefix = "") => {
    if (Array.isArray(value)) {
      return (
        <div
          className="accordion"
          id={`accordion${keyPrefix}${property.replace(/\s+/g, "-")}`}
        >
          <div className="accordion-item">
            <h2
              className="accordion-header"
              id={`heading${keyPrefix}${property.replace(/\s+/g, "-")}`}
            >
              <button
                className="accordion-button"
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`collapse${keyPrefix}${property.replace(
                  /\s+/g,
                  "-"
                )}`}
              >
                {property}
              </button>
            </h2>
            <div
              id={`collapse${keyPrefix}${property.replace(/\s+/g, "-")}`}
              className={`accordion-collapse collapse ${
                isExpanded ? "show" : ""
              }`}
              aria-labelledby={`heading${keyPrefix}${property.replace(
                /\s+/g,
                "-"
              )}`}
            >
              <div className="accordion-body">
                {value.map((item, index) => (
                  <div key={index}>
                    {typeof item === "object" ? (
                      <div className="accordion-item">
                        <h2
                          className="accordion-header"
                          id={`heading${keyPrefix}${index}`}
                        >
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${keyPrefix}${index}`}
                            aria-expanded="false"
                            aria-controls={`collapse${keyPrefix}${index}`}
                          >
                            {item.name || `Item ${index + 1}`}
                          </button>
                        </h2>
                        <div
                          id={`collapse${keyPrefix}${index}`}
                          className="accordion-collapse collapse"
                          aria-labelledby={`heading${keyPrefix}${index}`}
                        >
                          <div className="accordion-body">
                            {renderObject(item, `${keyPrefix}${index}-`)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <li key={index}>{addLink(item)}</li>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (typeof value === "object" && value !== null) {
      return (
        <div
          className="accordion"
          id={`accordion${keyPrefix}${property.replace(/\s+/g, "-")}`}
        >
          <div className="accordion-item">
            <h2
              className="accordion-header"
              id={`heading${keyPrefix}${property.replace(/\s+/g, "-")}-object`}
            >
              <button
                className="accordion-button"
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={`collapse${keyPrefix}${property.replace(
                  /\s+/g,
                  "-"
                )}-object`}
              >
                {property}
              </button>
            </h2>
            <div
              id={`collapse${keyPrefix}${property.replace(/\s+/g, "-")}-object`}
              className={`accordion-collapse collapse ${
                isExpanded ? "show" : ""
              }`}
              aria-labelledby={`heading${keyPrefix}${property.replace(
                /\s+/g,
                "-"
              )}-object`}
            >
              <div className="accordion-body">
                {renderObject(value, `${keyPrefix}`)}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return addLink(value);
  };

  const renderObject = (obj, keyPrefix = "") => {
    return (
      <ul>
        {Object.entries(obj).map(([key, val], index) => (
          <li key={index}>
            <strong>{key}: </strong>
            {Array.isArray(val)
              ? renderValue(val, `${keyPrefix}${index}-`)
              : typeof val === "object"
              ? renderValue(val, `${keyPrefix}${index}-`)
              : addLink(val)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <tr>
      <td>{property}</td>
      <td>{renderValue(value)}</td>
    </tr>
  );
};

export default TableRow;
