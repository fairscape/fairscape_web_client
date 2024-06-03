import React, { useState, useEffect } from "react";
import ButtonGroupComponent from "./components/ButtonGroupComponent";
import MetadataComponent from "./components/MetadataComponent";
import SerializationComponent from "./components/SerializationComponent";
import EvidenceGraphComponent from "./components/EvidenceGraphComponent";

const App = ({ type }) => {
  const [view, setView] = useState("metadata");

  useEffect(() => {
    document.title = `Fairscape ${type} Metadata`;
  }, [type]);

  const showMetadata = () => setView("metadata");
  const showJSON = () => setView("serialization");
  const showMermaid = () => setView("mermaid");

  const rocrate = {
    guid: "example-guid",
    name: "Example ROCrate",
    description: "This is an example ROCrate.",
    sourceOrganization: "Example Organization",
    metadataGraph: [
      {
        name: "Metadata 1",
        "@id": "metadata-1-id",
        "@type": "MetadataType",
        description: "Metadata 1 description",
        metadataType: "Type 1",
        keywords: "example, metadata",
      },
      // Add more metadata as needed
    ],
  };

  const json = JSON.stringify(rocrate, null, 2);
  const rdfXml = "<rdf>example rdf/xml content</rdf>";
  const turtle = "@prefix ex: <http://example.org/> .";

  const evidenceGraph = {
    name: "Example Graph",
    children: [
      {
        name: "Child 1",
        children: [{ name: "Grandchild 1" }, { name: "Grandchild 2" }],
      },
      {
        name: "Child 2",
        children: [{ name: "Grandchild 3" }],
      },
    ],
  };

  return (
    <div className="container">
      <h3>ROCrate Metadata: {rocrate.guid}</h3>
      <ButtonGroupComponent
        showMetadata={showMetadata}
        showJSON={showJSON}
        showMermaid={showMermaid}
      />
      {view === "metadata" && <MetadataComponent rocrate={rocrate} />}
      {view === "serialization" && (
        <SerializationComponent json={json} rdfXml={rdfXml} turtle={turtle} />
      )}
      {view === "mermaid" && (
        <EvidenceGraphComponent evidenceGraph={evidenceGraph} />
      )}
    </div>
  );
};

export default App;
