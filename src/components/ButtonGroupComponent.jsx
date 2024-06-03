import React from "react";

const ButtonGroupComponent = ({ showMetadata, showJSON, showMermaid }) => {
  return (
    <div
      className="btn-group"
      role="group"
      aria-label="Basic radio toggle button group"
    >
      <input
        type="radio"
        onClick={showMetadata}
        className="btn-check"
        name="btnradio"
        id="btn-metadata"
        autoComplete="off"
        defaultChecked
      />
      <label className="btn btn-outline-primary" htmlFor="btn-metadata">
        Metadata
      </label>

      <input
        type="radio"
        onClick={showJSON}
        className="btn-check"
        name="btnradio"
        id="btn-json"
        autoComplete="off"
      />
      <label className="btn btn-outline-primary" htmlFor="btn-json">
        Serialization
      </label>

      <input
        type="radio"
        onClick={showMermaid}
        className="btn-check"
        name="btnradio"
        id="btn-mermaid"
        autoComplete="off"
      />
      <label className="btn btn-outline-primary" htmlFor="btn-mermaid">
        Evidence Graph
      </label>
    </div>
  );
};

export default ButtonGroupComponent;
