import React, { useState, useCallback } from "react";

const SerializationComponent = ({ json, rdfXml, turtle }) => {
  const [serializationType, setSerializationType] = useState("json");

  const showSerialization = (type) => {
    setSerializationType(type);
  };

  const getSerializationContent = () => {
    switch (serializationType) {
      case "json":
        return json;
      case "rdfXml":
        return rdfXml;
      case "turtle":
        return turtle;
      default:
        return "";
    }
  };

  const copyToClipboard = useCallback(() => {
    const content = getSerializationContent();
    navigator.clipboard
      .writeText(content)
      .then(() => {
        alert(`${serializationType.toUpperCase()} copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }, [serializationType, json, rdfXml, turtle]);

  const getCopyButtonLabel = () => {
    switch (serializationType) {
      case "json":
        return "Copy JSON-LD";
      case "rdfXml":
        return "Copy RDF/XML";
      case "turtle":
        return "Copy Turtle";
      default:
        return "Copy";
    }
  };

  return (
    <div>
      <div
        className="serialization-btn-group"
        style={{ marginTop: "20px", textAlign: "center" }}
      >
        <div
          className="btn-group"
          role="group"
          aria-label="Serialization options"
          style={{ width: "50%" }}
        >
          <input
            type="radio"
            onClick={() => showSerialization("json")}
            className="btn-check"
            name="serialization"
            id="serialization-json"
            autoComplete="off"
            defaultChecked
          />
          <label
            className="btn btn-sm btn-outline-info"
            htmlFor="serialization-json"
          >
            JSON-LD
          </label>
          <input
            type="radio"
            onClick={() => showSerialization("rdfXml")}
            className="btn-check"
            name="serialization"
            id="serialization-rdf"
            autoComplete="off"
          />
          <label
            className="btn btn-sm btn-outline-info"
            htmlFor="serialization-rdf"
          >
            RDF/XML
          </label>
          <input
            type="radio"
            onClick={() => showSerialization("turtle")}
            className="btn-check"
            name="serialization"
            id="serialization-turtle"
            autoComplete="off"
          />
          <label
            className="btn btn-sm btn-outline-info"
            htmlFor="serialization-turtle"
          >
            Turtle
          </label>
        </div>
      </div>
      <div className="json-wrapper">
        <pre>{getSerializationContent()}</pre>
        <button
          className="copy-btn"
          onClick={copyToClipboard}
          title={getCopyButtonLabel()}
        >
          <i className="fas fa-copy"></i> {getCopyButtonLabel()}
        </button>
      </div>
    </div>
  );
};

export default SerializationComponent;
