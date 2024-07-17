import React, { useState } from "react";

const FAIRSCAPE_URL = "http://example.com/"; // Replace with your actual URL
const urlPattern = /^(http|https):\/\/[^\s]+/;
const identifierPattern = /^ark:[0-9]{5}\/.*$/;

const Link = ({ value, download = false }) => {
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

const Accordion = ({
  title,
  children,
  isExpanded,
  onToggle,
  isSubItem = false,
}) => (
  <div className={`accordion-item ${isSubItem ? "sub-item" : ""}`}>
    <h2 className="accordion-header">
      <button
        className={`accordion-button ${isExpanded ? "" : "collapsed"} ${
          isSubItem ? "sub-item-button" : ""
        }`}
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        {title}
      </button>
    </h2>
    <div className={`accordion-collapse collapse ${isExpanded ? "show" : ""}`}>
      <div className={`accordion-body ${isSubItem ? "sub-item-body" : ""}`}>
        {children}
      </div>
    </div>
  </div>
);

const ArrayRenderer = ({ items }) => (
  <ul>
    {items.map((item, index) => (
      <li key={index}>
        {typeof item === "object" ? (
          <ObjectRenderer object={item} />
        ) : (
          <Link value={item} />
        )}
      </li>
    ))}
  </ul>
);

const ObjectRenderer = ({ object }) => {
  if (object === null || object === undefined) {
    return <span>No data</span>;
  }
  return (
    <ul>
      {Object.entries(object).map(([key, value], index) => (
        <li key={index}>
          <strong>{key}: </strong>
          <ValueRenderer value={value} />
        </li>
      ))}
    </ul>
  );
};

const PropertiesRenderer = ({ properties }) => {
  const [expandedProps, setExpandedProps] = useState({});

  return (
    <div>
      <button
        className="btn btn-secondary"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseProperties"
      >
        Show/Hide Properties
      </button>
      <div className="collapse" id="collapseProperties">
        {Object.entries(properties).map(([propName, propDetails], index) => (
          <Accordion
            key={index}
            title={propName}
            isExpanded={expandedProps[propName] || false}
            onToggle={() => {
              setExpandedProps((prev) => ({
                ...prev,
                [propName]: !prev[propName],
              }));
            }}
            isSubItem={true}
          >
            <strong>Description:</strong>{" "}
            {propDetails.description || "No description"}
            <br />
            <strong>Type:</strong> {propDetails.type || "No type specified"}
            <br />
            <strong>Index:</strong> {propDetails.index || "No index specified"}
          </Accordion>
        ))}
      </div>
    </div>
  );
};

const ValueRenderer = ({ value }) => {
  if (value === null || value === undefined) {
    return <span>No data</span>;
  }
  if (Array.isArray(value)) {
    return <ArrayRenderer items={value} />;
  } else if (typeof value === "object") {
    return <ObjectRenderer object={value} />;
  }
  return <Link value={value} />;
};

const TableRow = ({ property, value }) => {
  const [isMainExpanded, setIsMainExpanded] = useState(false);
  const [expandedSubItems, setExpandedSubItems] = useState({});

  const renderValue = () => {
    if (property === "Properties") {
      return <PropertiesRenderer properties={value} />;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return <ValueRenderer value={value} />;
    }

    if (
      Array.isArray(value) &&
      value.every((item) => typeof item === "object" && item !== null)
    ) {
      return (
        <Accordion
          title={`${property} (${value.length} items)`}
          isExpanded={isMainExpanded}
          onToggle={() => setIsMainExpanded(!isMainExpanded)}
        >
          {value.map((item, index) => (
            <Accordion
              key={index}
              title={item.name || `Item ${index + 1}`}
              isExpanded={expandedSubItems[index] || false}
              onToggle={() => {
                setExpandedSubItems((prev) => ({
                  ...prev,
                  [index]: !prev[index],
                }));
              }}
              isSubItem={true}
            >
              <ObjectRenderer object={item} />
            </Accordion>
          ))}
        </Accordion>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <Accordion
          title={property}
          isExpanded={isMainExpanded}
          onToggle={() => setIsMainExpanded(!isMainExpanded)}
        >
          <ObjectRenderer object={value} />
        </Accordion>
      );
    }

    return <span>No data</span>;
  };

  return (
    <tr>
      <td>{property}</td>
      <td>{renderValue()}</td>
    </tr>
  );
};

export default TableRow;
