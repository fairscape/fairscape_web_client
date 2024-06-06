// MetadataComponent.js
import React from "react";
import TableRow from "./TableRow";
import {
  ROCrateProperties,
  DatasetProperties,
  SoftwareProperties,
  SchemaProperties,
} from "./metadataProperties.js";

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

const MetadataComponent = ({ metadata }) => {
  const properties = getPropertyList(metadata["@type"]);

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
    </div>
  );
};

export default MetadataComponent;
