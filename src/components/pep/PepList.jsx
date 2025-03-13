import React from "react";
import "./PepList.css";

const PepList = ({ pepSchemas, onSelectPep }) => {
  return (
    <div className="pep-list-container">
      <h2>Select a PEP Schema</h2>
      {pepSchemas.length === 0 ? (
        <div className="no-peps">No PEP schemas available</div>
      ) : (
        <div className="pep-list">
          {pepSchemas.map((schema, index) => (
            <div
              key={index}
              className="pep-item"
              onClick={() => onSelectPep(schema)}
            >
              <h3>{schema.name}</h3>
              <p>{schema.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PepList;
