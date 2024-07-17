import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import jsonld from "jsonld";
import N3 from "n3";
import ButtonGroupComponent from "../components/MetadataViewer/ButtonGroupComponent";
import MetadataComponent from "../components/MetadataViewer/MetadataComponent";
import SerializationComponent from "../components/MetadataViewer/SerializationComponent";
import EvidenceGraphComponent from "../components/MetadataViewer/EvidenceGraphComponent";

const API_URL =
  process.env.REACT_APP_FAIRSCAPE_API_URL || "http://fairscape.net";

const MetadataPage = () => {
  const { type: rawType } = useParams();
  const location = useLocation();
  const ark = location.pathname.split("/").slice(2).join("/");
  const [view, setView] = useState("metadata");
  const [metadata, setMetadata] = useState(null);
  const [evidenceGraph, setEvidenceGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evidenceGraphLoading, setEvidenceGraphLoading] = useState(true);
  const [turtle, setTurtle] = useState("");
  const [rdfXml, setRdfXml] = useState("");

  const mapType = (rawType) => {
    const typeMap = {
      rocrate: "ROCrate",
      dataset: "Dataset",
      software: "Software",
      schema: "Schema",
    };
    return typeMap[rawType.toLowerCase()] || rawType;
  };

  const type = mapType(rawType);

  function filter_nonprov(d, keys_to_keep) {
    if (typeof d === "object" && d !== null) {
      if (Array.isArray(d)) {
        return d.map((item) => filter_nonprov(item, keys_to_keep));
      } else {
        return Object.fromEntries(
          Object.entries(d)
            .filter(([k]) => keys_to_keep.includes(k))
            .map(([k, v]) => [k, filter_nonprov(v, keys_to_keep)])
        );
      }
    }
    return d;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metadataResponse = await axios.get(
          `${API_URL}/${rawType}/${ark}`
        );
        const metadataData = metadataResponse.data;
        console.log("Fetched metadata:", metadataData);

        if (!metadataData || typeof metadataData !== "object") {
          console.error("Invalid metadata format:", metadataData);
          return;
        }

        setMetadata(metadataData);
        document.title = `Fairscape ${type} Metadata`;

        try {
          const nquads = await jsonld.toRDF(metadataData, {
            format: "application/n-quads",
          });
          console.log("Successfully converted to N-Quads");

          const parser = new N3.Parser();
          const writer = new N3.Writer({ format: "text/turtle" });
          parser.parse(nquads, (error, quad, prefixes) => {
            if (quad) writer.addQuad(quad);
            else writer.end((error, result) => setTurtle(result));
          });

          const rdfXmlData = await jsonld.toRDF(metadataData, {
            format: "application/rdf+xml",
          });
          setRdfXml(rdfXmlData);
        } catch (error) {
          console.error("Error converting JSON-LD to RDF:", error);
          console.log("Metadata data:", metadataData);
        }

        try {
          const evidenceGraphResponse = await axios.get(
            `${API_URL}/evidencegraph/${ark}`
          );
          setEvidenceGraph(evidenceGraphResponse.data);
          console.log("Evidence Graph:", evidenceGraphResponse.data);
        } catch (error) {
          console.error("Error fetching evidence graph:", error);
          const keys_to_keep = [
            "@id",
            "name",
            "description",
            "@type",
            "generatedBy",
            "isPartOf",
            "@graph",
            "usedByComputation",
            "usedSoftware",
            "usedDataset",
          ];
          const filteredMetadata = filter_nonprov(metadataData, keys_to_keep);
          setEvidenceGraph(filteredMetadata);
          console.log("Evidence Graph:", filteredMetadata);
        } finally {
          setEvidenceGraphLoading(false);
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rawType, ark, type]);

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
        {type} Metadata: {metadata.guid}
      </h3>
      <ButtonGroupComponent
        showMetadata={showMetadata}
        showJSON={showJSON}
        showEvidenceGraph={showEvidenceGraph}
      />
      {view === "metadata" && (
        <MetadataComponent metadata={metadata} type={type} />
      )}
      {view === "serialization" && (
        <SerializationComponent json={json} rdfXml={rdfXml} turtle={turtle} />
      )}
      {view === "evidenceGraph" && !evidenceGraphLoading && (
        <EvidenceGraphComponent evidenceGraph={evidenceGraph} />
      )}
    </div>
  );
};

export default MetadataPage;
