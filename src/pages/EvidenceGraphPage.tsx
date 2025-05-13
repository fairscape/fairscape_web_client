// src/pages/EvidenceGraphPage.tsx
import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import axios from "axios";

// Types and Components
import { RawGraphData, SupportData, SupportingElement } from "../types";
import EvidenceGraphViewer from "../components/EvidenceGraph/EvidenceGraphViewer";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";

// Context and Services
import { AuthContext } from "../context/AuthContext";

// Styled Components
const Container = styled.div`
  max-width: 95%;
  width: 95%;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.header`
  margin-bottom: 20px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  padding-bottom: 15px;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 20px;
  border-radius: 5px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.primary};
`;

const ArkIdDisplay = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: monospace;
  margin-top: 10px;
`;

const GraphContainer = styled.div`
  width: 100%;
  /* Removed fixed height: 75vh;
     The EvidenceGraphViewer component should manage the height of its
     internal graph visualization (e.g., setting it to ~70-75vh).
     This container will then expand to fit both the graph
     and any supporting elements rendered below it by EvidenceGraphViewer. */
  margin: 0 auto;
`;

const Footer = styled.footer`
  margin-top: 30px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 5px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// API URL from environment variable
const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

// --- Support Data Extraction Logic ---
interface TraverseParams {
  node: any;
  results: SupportData;
  seenIds: Set<string>;
}

const traverseAndCollect = ({
  node,
  results,
  seenIds,
}: TraverseParams): void => {
  if (
    !node ||
    typeof node !== "object" ||
    !node["@id"] ||
    seenIds.has(node["@id"])
  ) {
    return;
  }
  seenIds.add(node["@id"]);

  let nodeTypes: string[] = [];
  if (typeof node["@type"] === "string") nodeTypes = [node["@type"]];
  else if (Array.isArray(node["@type"])) nodeTypes = node["@type"];
  else nodeTypes = ["Unknown"];

  const outputElement: SupportingElement = {
    "@id": node["@id"],
    name: node.name || "N/A",
    description: node.description || "",
    "@type": node["@type"] || "Unknown",
  };

  if (
    nodeTypes.some((t) => t.includes("Dataset")) &&
    !results.datasets.some((el) => el["@id"] === node["@id"])
  )
    results.datasets.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Software")) &&
    !results.software.some((el) => el["@id"] === node["@id"])
  )
    results.software.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Computation")) &&
    !results.computations.some((el) => el["@id"] === node["@id"])
  )
    results.computations.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Sample")) &&
    !results.samples.some((el) => el["@id"] === node["@id"])
  )
    results.samples.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Experiment")) &&
    !results.experiments.some((el) => el["@id"] === node["@id"])
  )
    results.experiments.push(outputElement);
  else if (
    nodeTypes.some((t) => t.includes("Instrument")) &&
    !results.instruments.some((el) => el["@id"] === node["@id"])
  )
    results.instruments.push(outputElement);

  const relationshipKeys = [
    "generatedBy",
    "usedDataset",
    "usedSoftware",
    "usedSample",
    "usedInstrument",
    "hasPart",
  ];

  for (const key of relationshipKeys) {
    const relatedItems = node[key];
    if (!relatedItems) continue;

    const itemsToProcess = Array.isArray(relatedItems)
      ? relatedItems
      : [relatedItems];

    for (const item of itemsToProcess) {
      if (item && typeof item === "object") {
        traverseAndCollect({ node: item, results, seenIds });
      }
    }
  }
};

const extractSupportData = (
  graphData: RawGraphData | null
): SupportData | null => {
  if (
    !graphData ||
    !graphData["@graph"] ||
    typeof graphData["@graph"] !== "object" // Note: @graph can be an array or object
  ) {
    return null;
  }

  const results: SupportData = {
    datasets: [],
    software: [],
    computations: [],
    samples: [],
    experiments: [],
    instruments: [],
  };
  const seenIds = new Set<string>();

  const graphContent = graphData["@graph"];
  if (Array.isArray(graphContent)) {
    graphContent.forEach((item) =>
      traverseAndCollect({ node: item, results, seenIds })
    );
  } else if (typeof graphContent === "object" && graphContent !== null) {
    traverseAndCollect({ node: graphContent, results, seenIds });
  }

  const hasData = Object.values(results).some((arr) => arr.length > 0);
  return hasData ? results : null;
};
// --- End of Support Data Extraction Logic ---

const EvidenceGraphPage: React.FC = () => {
  const location = window.location.pathname;
  const arkId = location.includes("/evidence/")
    ? location.split("/evidence/")[1]
    : "";

  const [evidenceGraph, setEvidenceGraph] = useState<RawGraphData | null>(null);
  const [supportData, setSupportData] = useState<SupportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn } = useContext(AuthContext);

  const fetchEvidenceGraphById = async (graphId: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await axios.get(`${API_URL}/${graphId}`, { headers });
      return response.data;
    } catch (error) {
      console.error("Error fetching evidence graph by ID:", error);
      return null;
    }
  };

  const fetchGraphData = async (arkId: string) => {
    if (!arkId) {
      return { graph: null, error: "No ARK ID provided" };
    }
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const cleanArkId = arkId.replace(/^\/|\/$/g, "");
      const url = `${API_URL}/${cleanArkId}`;
      console.log("Requesting URL for evidence graph:", url);

      const response = await axios.get(url, {
        headers,
        timeout: 10000,
        maxRedirects: 5,
        withCredentials: true,
      });
      const data = response.data;
      console.log("Response data for evidence graph:", data);

      if (data["@graph"]) {
        return { graph: data, error: null };
      }

      if (
        data.hasEvidenceGraph ||
        (data.metadata && data.metadata.hasEvidenceGraph)
      ) {
        const hasGraph =
          data.hasEvidenceGraph || data.metadata.hasEvidenceGraph;
        const graphId =
          typeof hasGraph === "string" ? hasGraph : hasGraph["@id"];
        const graphData = await fetchEvidenceGraphById(graphId);
        if (graphData && graphData["@graph"]) {
          return { graph: graphData, error: null };
        } else {
          return { graph: null, error: "Referenced evidence graph not found" };
        }
      }
      return { graph: null, error: "No graph data found for this ARK ID" };
    } catch (err: any) {
      console.error("Error fetching graph data:", err);
      return {
        graph: null,
        error: err.message || "Failed to fetch graph data",
      };
    }
  };

  useEffect(() => {
    const loadGraphData = async () => {
      setLoading(true);
      setError(null);
      setEvidenceGraph(null);
      setSupportData(null);

      const result = await fetchGraphData(arkId);

      if (result.error) {
        setError(result.error);
      } else if (result.graph) {
        setEvidenceGraph(result.graph);
        const extractedSupport = extractSupportData(result.graph);
        setSupportData(extractedSupport);
      } else {
        setError("No graph data available");
      }
      setLoading(false);
    };

    if (arkId) {
      loadGraphData();
    } else {
      setError("No ARK ID provided in URL.");
      setLoading(false);
    }
  }, [arkId, isLoggedIn]);

  useEffect(() => {
    document.title = `Evidence Graph ${
      arkId ? `for ${arkId}` : ""
    } - FAIRSCAPE`;
  }, [arkId]);

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (error)
      return <Alert type="error" title="Error Loading Data" message={error} />;
    if (!evidenceGraph)
      return (
        <Alert
          type="info"
          title="No Graph Data"
          message="Graph data is not available for this item."
        />
      );

    return (
      <GraphContainer>
        <EvidenceGraphViewer
          evidenceGraphData={evidenceGraph}
          supportData={supportData}
        />
      </GraphContainer>
    );
  };

  return (
    <Container>
      <Header>
        <PageTitle>Evidence Graph</PageTitle>
        {arkId && <ArkIdDisplay>ARK: {arkId}</ArkIdDisplay>}
      </Header>

      {renderContent()}

      <Footer>
        Metadata & Provenance: This metadata and provenance were generated by
        the FAIRSCAPE AI-readiness platform (Al Manir, et al. a2024, BioRXiv
        2024.12.23.629818;
        <a
          href="https://doi.org/10.1101/2024.12.23.629818"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://doi.org/10.1101/2024.12.23.629818
        </a>
        ).
      </Footer>
    </Container>
  );
};

export default EvidenceGraphPage;
