import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import jsonld from "jsonld";
import N3 from "n3";
import ButtonGroupComponent from "../components/MetadataViewer/ButtonGroupComponent";
import MetadataComponent from "../components/MetadataViewer/MetadataComponent";
import SerializationComponent from "../components/MetadataViewer/SerializationComponent";
import EvidenceGraphComponent from "../components/MetadataViewer/EvidenceGraphComponent";
import Header from "../components/header_footer/Header";
import Footer from "../components/header_footer/Footer";
import convertToRdfXml from "./helper";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const MetadataPage = () => {
  const { type: rawType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [type, setType] = useState(rawType);
  const [ark, setArk] = useState("");
  const [view, setView] = useState("metadata");
  const [metadata, setMetadata] = useState(null);
  const [evidenceGraph, setEvidenceGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evidenceGraphLoading, setEvidenceGraphLoading] = useState(true);
  const [turtle, setTurtle] = useState("");
  const [rdfXml, setRdfXml] = useState("");

  const typeMap = {
    rocrate: "ROCrate",
    dataset: "Dataset",
    software: "Software",
    schema: "Schema",
    computation: "Computation",
  };

  const mapType = (rawType) => typeMap[rawType.toLowerCase()] || rawType;

  const extractRawType = (type) => {
    if (typeof type === "string") {
      if (type.startsWith("http://") || type.startsWith("https://")) {
        const parts = type.split(/[/#]/);
        return parts[parts.length - 1].toLowerCase();
      }
      return type.toLowerCase();
    }
    if (Array.isArray(type) && type.length > 0) {
      return extractRawType(type[0]);
    }
    return null;
  };

  const filterNonProv = (data, keysToKeep) => {
    if (typeof data !== "object" || data === null) return data;
    if (Array.isArray(data))
      return data.map((item) => filterNonProv(item, keysToKeep));
    return Object.fromEntries(
      Object.entries(data)
        .filter(([k]) => keysToKeep.includes(k))
        .map(([k, v]) => [k, filterNonProv(v, keysToKeep)])
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      //Weird handling so that users can visit /ark:... and rocrate/ark:...
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let currentType = type;
        let currentArk = location.pathname.split("/").slice(2).join("/");

        if (/^ark:\d{5}/.test(rawType)) {
          currentArk = location.pathname.slice(1);
          const response = await axios.get(`${API_URL}/${currentArk}`, {
            headers,
          });
          const data = response.data;

          if (data && data["@type"]) {
            currentType = extractRawType(data["@type"]);
            setType(currentType);
            navigate(`/${currentType}/${currentArk}`, { replace: true });
          } else {
            throw new Error("Unable to determine the type of the metadata");
          }
        }

        setArk(currentArk);
        const metadataResponse = await axios.get(`${API_URL}/${currentArk}`, {
          headers,
        });
        let metadataData = metadataResponse.data;

        if (!metadataData || typeof metadataData !== "object") {
          throw new Error("Invalid metadata format");
        }

        metadataData.download =
          currentType.toLowerCase() === "rocrate"
            ? `${API_URL}/rocrate/download/${currentArk}`
            : `${API_URL}/dataset/download/${currentArk}`;

        setMetadata(metadataData);
        document.title = `Fairscape ${mapType(currentType)} Metadata`;

        await generateRdfFormats(metadataData);
        await fetchEvidenceGraph(metadataData, headers);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rawType, location.pathname, navigate]);

  const generateRdfFormats = async (metadataData) => {
    try {
      const nquads = await jsonld.toRDF(metadataData, {
        format: "application/n-quads",
      });
      const parser = new N3.Parser();
      const writer = new N3.Writer({ format: "text/turtle" });

      parser.parse(nquads, (error, quad, prefixes) => {
        if (error) console.error("Error parsing N-Quads:", error);
        if (quad) writer.addQuad(quad);
        else {
          writer.end((error, result) => {
            if (error) console.error("Error generating Turtle:", error);
            else setTurtle(result);
          });
        }
      });

      const rdfXml = await convertToRdfXml(nquads);
      setRdfXml(rdfXml);
    } catch (error) {
      console.error("Error converting RDF:", error);
    }
  };

  const fetchEvidenceGraph = async (metadataData, headers) => {
    try {
      const keysToKeep = [
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
        "evidence",
      ];
      let evidenceGraphData;

      if (metadataData.hasEvidenceGraph) {
        const evidenceGraphResponse = await axios.get(
          `${API_URL}/${metadataData.hasEvidenceGraph}`,
          { headers }
        );
        evidenceGraphData = filterNonProv(
          evidenceGraphResponse.data,
          keysToKeep
        );
      } else {
        evidenceGraphData = filterNonProv(metadataData, keysToKeep);
      }

      setEvidenceGraph(evidenceGraphData);
    } catch (error) {
      console.error("Error fetching evidence graph:", error);
      setEvidenceGraph(filterNonProv(metadataData, keysToKeep));
    } finally {
      setEvidenceGraphLoading(false);
    }
  };

  const showMetadata = () => setView("metadata");
  const showJSON = () => setView("serialization");
  const showEvidenceGraph = () => setView("evidenceGraph");

  if (loading) return <div>Loading...</div>;
  if (!metadata) return <div>Error loading metadata</div>;

  const json = JSON.stringify(metadata, null, 2);

  return (
    <div id="root">
      <Header />
      <div className="page-content">
        <div className="container">
          <h3>
            {mapType(type)} Metadata: {metadata.guid}
          </h3>
          <ButtonGroupComponent
            showMetadata={showMetadata}
            showJSON={showJSON}
            showEvidenceGraph={showEvidenceGraph}
          />
          {view === "metadata" && (
            <MetadataComponent metadata={metadata} type={mapType(type)} />
          )}
          {view === "serialization" && (
            <SerializationComponent
              json={json}
              rdfXml={rdfXml}
              turtle={turtle}
            />
          )}
          {view === "evidenceGraph" && !evidenceGraphLoading && (
            <EvidenceGraphComponent evidenceGraph={evidenceGraph} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MetadataPage;
