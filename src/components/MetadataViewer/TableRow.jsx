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

const Accordion = ({ title, children, isExpanded, onToggle }) => (
  <div className="accordion-item">
    <h2 className="accordion-header">
      <button
        className={`accordion-button ${isExpanded ? "" : "collapsed"}`}
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        {title}
      </button>
    </h2>
    <div className={`accordion-collapse collapse ${isExpanded ? "show" : ""}`}>
      <div className="accordion-body">{children}</div>
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

const ObjectRenderer = ({ object }) => (
  <ul>
    {Object.entries(object).map(([key, value], index) => (
      <li key={index}>
        <strong>{key}: </strong>
        {Array.isArray(value) ? (
          <ArrayRenderer items={value} />
        ) : typeof value === "object" ? (
          <ObjectRenderer object={value} />
        ) : (
          <Link value={value} />
        )}
      </li>
    ))}
  </ul>
);

const PropertiesRenderer = ({ properties }) => (
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
        <Accordion key={index} title={propName}>
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

const ValueRenderer = ({ value }) => {
  if (Array.isArray(value)) {
    return <ArrayRenderer items={value} />;
  } else if (typeof value === "object" && value !== null) {
    return <ObjectRenderer object={value} />;
  }
  return <Link value={value} />;
};

const TableRow = ({ property, value }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <tr>
      <td>{property}</td>
      <td>
        {property === "Properties" ? (
          <PropertiesRenderer properties={value} />
        ) : (
          <Accordion
            title={property}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
          >
            <ValueRenderer value={value} />
          </Accordion>
        )}
      </td>
    </tr>
  );
};

export default TableRow;
