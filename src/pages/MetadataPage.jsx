import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ButtonGroupComponent from "../components/MetadataViewer/ButtonGroupComponent";
import MetadataComponent from "../components/MetadataViewer/MetadataComponent";
import SerializationComponent from "../components/MetadataViewer/SerializationComponent";
import EvidenceGraphComponent from "../components/MetadataViewer/EvidenceGraphComponent";
import { useMetadataOperations } from "../hooks/useMetadataOperations";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const MetadataPage = () => {
  const { type: rawType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState("metadata");

  const [metadata, setMetadata] = useState(null);
  const [evidenceGraph, setEvidenceGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evidenceGraphLoading, setEvidenceGraphLoading] = useState(true);
  const [type, setType] = useState(rawType);
  const [ark, setArk] = useState("");
  const [turtle, setTurtle] = useState("");
  const [rdfXml, setRdfXml] = useState("");

  const { fetchMetadata, mapType, extractRawType } = useMetadataOperations({
    setMetadata,
    setEvidenceGraph,
    setEvidenceGraphLoading,
    setTurtle,
    setRdfXml,
  });

  useEffect(() => {
    const initializeMetadata = async () => {
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
        setLoading(true);
        await fetchMetadata(currentArk, currentType, headers);
        document.title = `Fairscape ${mapType(currentType)} Metadata`;
      } catch (error) {
        console.error("Error initializing metadata:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeMetadata();
  }, [rawType, location.pathname]);

  const showMetadata = () => setView("metadata");
  const showJSON = () => setView("serialization");
  const showEvidenceGraph = () => setView("evidenceGraph");

  if (loading) return <div>Loading...</div>;
  if (!metadata) return <div>Error loading metadata</div>;

  const json = JSON.stringify(metadata, null, 2);

  return (
    <div className="page-content">
      <div className="container">
        <h3>
          {mapType(type)} Metadata: {metadata["@id"]}
        </h3>
        <ButtonGroupComponent
          showMetadata={showMetadata}
          showJSON={showJSON}
          showEvidenceGraph={showEvidenceGraph}
        />
        {view === "metadata" && (
          <>
            <MetadataComponent metadata={metadata} type={mapType(type)} />
            {type.toLowerCase() === "rocrate" && (
              <div className="text-center mt-4">
                <Link
                  to={`/publish/${metadata["@id"]}`}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: "#0d6efd",
                    borderColor: "#0d6efd",
                    color: "white",
                    padding: "8px 16px",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontWeight: 500,
                    display: "inline-block",
                  }}
                >
                  Publish ROCrate to Dataverse
                </Link>
              </div>
            )}
          </>
        )}
        {view === "serialization" && (
          <SerializationComponent json={json} rdfXml={rdfXml} turtle={turtle} />
        )}
        {view === "evidenceGraph" && !evidenceGraphLoading && (
          <EvidenceGraphComponent evidenceGraph={evidenceGraph} />
        )}
      </div>
    </div>
  );
};

export default MetadataPage;
