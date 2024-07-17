import React, { useState } from "react";
import TableRow from "./TableRow";
import SimpleTableRowComponent from "./SimpleTableRowComponent";
import {
  ROCrateProperties,
  DatasetProperties,
  SoftwareProperties,
  SchemaProperties,
} from "./metadataProperties";

const getPropertyList = (type) => {
  switch (type) {
    case "ROCrate":
      return ROCrateProperties;
    case "Dataset":
      return DatasetProperties;
    case "Software":
      return SoftwareProperties;
    case "Schema":
      return SchemaProperties;
    default:
      return [];
  }
};

const MetadataComponent = ({ metadata, type }) => {
  const [showSimpleTable, setShowSimpleTable] = useState(false);
  const properties = getPropertyList(type);
  const displayedProperties = properties.map((property) => property.key);
  const additionalProperties = Object.keys(metadata).filter(
    (key) => !displayedProperties.includes(key) && key !== "@type"
  );

  console.log(properties);

  return (
    <div className="container">
      <div className="table-container">
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <TableRow
                key={property.name}
                property={property.name}
                value={metadata[property.key] || "N/A"}
              />
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setShowSimpleTable(!showSimpleTable)}>
        {showSimpleTable
          ? "Hide Additional Properties"
          : "Show Additional Properties"}
      </button>
      {showSimpleTable && (
        <div className="table-container">
          <table className="table table-sm table-bordered mt-3">
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {additionalProperties.map((key) => (
                <SimpleTableRowComponent
                  key={key}
                  property={key}
                  value={metadata[key] || "N/A"}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MetadataComponent;
