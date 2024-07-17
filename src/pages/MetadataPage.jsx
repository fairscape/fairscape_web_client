import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import jsonld from "jsonld";
import N3 from "n3";
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
  const [turtle, setTurtle] = useState("");
  const [rdfXml, setRdfXml] = useState("");

  useEffect(() => {
    document.title = `Fairscape ${type} Metadata`;

    const fetchData = async () => {
      try {
        const metadataResponse = await axios.get(
          `http://fairscape.net/${type}/${ark}`
        );
        setMetadata(metadataResponse.data);

        // Convert JSON-LD to Turtle
        const nquads = await jsonld.toRDF(metadataResponse.data, {
          format: "application/n-quads",
        });
        const parser = new N3.Parser();
        const writer = new N3.Writer({ format: "text/turtle" });

        parser.parse(nquads, (error, quad, prefixes) => {
          if (quad) writer.addQuad(quad);
          else writer.end((error, result) => setTurtle(result));
        });

        // Convert JSON-LD to RDF/XML
        const rdfXmlData = await jsonld.toRDF(metadataResponse.data, {
          format: "application/rdf+xml",
        });
        setRdfXml(rdfXmlData);

        try {
          const evidenceGraphResponse = await axios.get(
            `http://fairscape.net/evidencegraph/${ark}`
          );
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
