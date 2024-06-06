import React, { useState, useEffect } from "react";
import ButtonGroupComponent from "./components/ButtonGroupComponent";
import MetadataComponent from "./components/MetadataComponent";
import SerializationComponent from "./components/SerializationComponent";
import EvidenceGraphComponent from "./components/EvidenceGraphComponent";

const MetadataPage = ({ type }) => {
  const [view, setView] = useState("metadata");

  useEffect(() => {
    document.title = `Fairscape ${type} Metadata`;
  }, [type]);

  const showMetadata = () => setView("metadata");
  const showJSON = () => setView("serialization");
  const showEvidenceGraph = () => setView("evidenceGraph");

  const metadata = {
    guid: "ark:99999/example-guid",
    "@type": "ROCrate",
    name: "Example crate",
    description: "This is an example ROCrate.",
    sourceOrganization: {
      name: "Metadata 1",
      "@id": "ark:99999/metadata-1-id",
      "@type": "MetadataType",
      description: "Metadata 1 description",
      metadataType: "Type 1",
      keywords: "example, metadata",
    },
    metadataGraph: [
      {
        name: "Metadata 1",
        "@id": "ark:99999/metadata-1-id",
        "@type": "MetadataType",
        description: "Metadata 1 description",
        metadataType: "Type 1",
        keywords: "example, metadata",
      },
      {
        name: "Metadata 2",
        "@id": "ark:99999/metadata-2-id",
        "@type": "MetadataType",
        description: "Metadata 1 description",
        metadataType: "Type 1",
        keywords: "example, metadata",
      },
    ],
    distributions: ["Test1", "Test2"],
  };

  const json = JSON.stringify(metadata, null, 2);
  const rdfXml = "<rdf>example rdf/xml content</rdf>"; //TODO convert json to rdf/turtle
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
      <h3>
        {metadata["@type"]} Metadata: {metadata.guid}
      </h3>
      <ButtonGroupComponent
        showMetadata={showMetadata}
        showJSON={showJSON}
        showEvidenceGraph={showEvidenceGraph}
      />
      {view === "metadata" && <MetadataComponent metadata={metadata} />}
      {view === "serialization" && (
        <SerializationComponent json={json} rdfXml={rdfXml} turtle={turtle} />
      )}
      {view === "evidenceGraph" && (
        <EvidenceGraphComponent evidenceGraph={evidenceGraph} />
      )}
    </div>
  );
};

export default MetadataPage;
