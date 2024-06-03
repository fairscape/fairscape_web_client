import React from "react";
import TableRow from "./TableRow";

const MetadataComponent = ({ rocrate }) => {
  const properties = [
    { name: "Name", value: rocrate.name },
    { name: "Persistent Identifier", value: rocrate.guid },
    { name: "Description", value: rocrate.description },
    {
      name: "Source Organization",
      value: rocrate.sourceOrganization || "No source organization available",
    },
    { name: "Contains", value: rocrate.metadataGraph },
    { name: "Distributions", value: rocrate.distributions }, // Assuming distributions is an array
  ];

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
              value={property.value}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MetadataComponent;
