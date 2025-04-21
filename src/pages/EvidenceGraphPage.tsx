// src/pages/EvidenceGraphPage.tsx
import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import axios from "axios";

// Types and Components
import { RawGraphData } from "../types";
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
  height: 75vh;
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

const EvidenceGraphPage: React.FC = () => {
  // Extract ARK ID from URL path
  const location = window.location.pathname;
  const arkId = location.includes("/evidence/")
    ? location.split("/evidence/")[1]
    : "";

  const [evidenceGraph, setEvidenceGraph] = useState<RawGraphData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth context
  const { isLoggedIn } = useContext(AuthContext);

  // Function to fetch evidence graph by ID
  const fetchEvidenceGraphById = async (graphId: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_URL}/${graphId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching evidence graph by ID:", error);
      return null;
    }
  };

  // Function to fetch graph data for ARK
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

      const cleanArkId = arkId.replace(/^\/|\/$/g, ""); // Remove leading/trailing slashes
      const url = `${API_URL}/${cleanArkId}`;
      console.log("Requesting URL:", url);

      const response = await axios.get(url, {
        headers,
        timeout: 10000,
        maxRedirects: 5,
        withCredentials: true,
      });

      // Extract data from response
      const data = response.data;
      console.log("Response data:", data);

      if (data["@graph"]) {
        return { graph: data, error: null };
      }

      // Case 3: Item with hasEvidenceGraph reference
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

      const result = await fetchGraphData(arkId);

      if (result.error) {
        setError(result.error);
      } else if (result.graph) {
        setEvidenceGraph(result.graph);
      } else {
        setError("No graph data available");
      }

      setLoading(false);
    };

    loadGraphData();
  }, [arkId, isLoggedIn]);

  // Update Document Title
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
        <EvidenceGraphViewer evidenceGraphData={evidenceGraph} />
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
