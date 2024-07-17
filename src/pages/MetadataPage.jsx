import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import ButtonGroupComponent from "../components/MetadataViewer/ButtonGroupComponent";
import MetadataComponent from "../components/MetadataViewer/MetadataComponent";
import SerializationComponent from "../components/MetadataViewer/SerializationComponent";
import EvidenceGraphComponent from "../components/MetadataViewer/EvidenceGraphComponent";

const MetadataPage = () => {
  const { type } = useParams();
  const location = useLocation();
  const ark = location.pathname.split("/").slice(2).join("/");
  const [view, setView] = useState("metadata");
  const [metadata, setMetadata] = useState(null);
  const [evidenceGraph, setEvidenceGraph] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Fairscape ${type} Metadata`;

    const fetchData = async () => {
      try {
        const metadataResponse = await axios.get(`http://fairscape.net/${type}/${ark}`);
        setMetadata(metadataResponse.data);

        try {
          const evidenceGraphResponse = await axios.get(`http://fairscape.net/evidencegraph/${ark}`);
          setEvidenceGraph(evidenceGraphResponse.data);
        } catch (error) {
          console.error("Error fetching evidence graph:", error);
          setEvidenceGraph(metadataResponse.data);
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, ark]);

  const showMetadata = () => setView("metadata");
  const showJSON = () => setView("serialization");
  const showEvidenceGraph = () => setView("evidenceGraph");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!metadata) {
    return <div>Error loading metadata</div>;
  }

  const json = JSON.stringify(metadata, null, 2);
  const rdfXml = "<rdf>example rdf/xml content</rdf>"; // TODO: convert JSON to RDF/XML
  const turtle = "@prefix ex: <http://example.org/> ."; // TODO: convert JSON to Turtle

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