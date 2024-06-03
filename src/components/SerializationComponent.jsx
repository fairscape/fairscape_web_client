import React from "react";

const SerializationComponent = ({ json, rdfXml, turtle }) => {
  const [serializationType, setSerializationType] = React.useState("json");

  const showSerialization = (type) => {
    setSerializationType(type);
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
        {serializationType === "json" && <pre>{json}</pre>}
        {serializationType === "rdfXml" && <pre>{rdfXml}</pre>}
        {serializationType === "turtle" && <pre>{turtle}</pre>}
        <button className="copy-btn" title="Copy JSON-LD">
          <i className="fas fa-copy"></i> Copy JSON-LD
        </button>
      </div>
    </div>
  );
};

export default SerializationComponent;
