import React, { useState } from "react";
import TableRow from "./metadataResolver/TableRow";
import SimpleTableRowComponent from "./metadataResolver/SimpleTableRowComponent";
import {
  ROCrateProperties,
  DatasetProperties,
  SoftwareProperties,
  SchemaProperties,
} from "./metadataResolver/metadataProperties";

const getPropertyList = (type) => {
  const cleanType = type.replace(/^evi:/, "");

  switch (cleanType) {
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

const MetadataComponent = ({ metadata }) => {
  const [showSimpleTable, setShowSimpleTable] = useState(false);
  const properties = getPropertyList(metadata["@type"]);
  const displayedProperties = properties.map((property) => property.key);
  const additionalProperties = Object.keys(metadata).filter(
    (key) => !displayedProperties.includes(key) && key !== "@type"
  );

  return (
    <div className="container">
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
      <button onClick={() => setShowSimpleTable(!showSimpleTable)}>
        {showSimpleTable
          ? "Hide Additional Properties"
          : "Show Additional Properties"}
      </button>
      {showSimpleTable && (
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
      )}
    </div>
  );
};

export default MetadataComponent;
