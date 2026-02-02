import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import axios from "axios";

// Import AuthContext
import { AuthContext } from "../../context/AuthContext";
// Import TreeView Component
import ROCrateTreeView from "./ROCrateTreeView";

const API_URL =
  window.API_URL;

const DashboardContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const Spinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.background};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Error message component
const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: #fff3f3;
  border: 1px solid #ffcaca;
  border-radius: ${({ theme }) => theme.borderRadius};
  color: #d8000c;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

interface CategoryCounts {
  datasets: number;
  software: number;
  computations: number;
  schemas: number;
  samples: number;
  mlModels: number;
  rocrates: number;
  other: number;
  total: number;
}

interface RoCrate {
  "@id": string;
  name: string;
  description: string;
  counts?: CategoryCounts;
}

const Dashboard: React.FC = () => {
  const [rocrates, setRocrates] = useState<RoCrate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get authentication context
  const { isLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    const fetchRocrates = async () => {
      setLoading(true);
      setError(null);

      try {
        let response;

        // If logged in, make the real API call
        if (isLoggedIn) {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          try {
            response = await axios.get(`${API_URL}/rocrate`, { headers });
            setRocrates(response.data.rocrates || []);
          } catch (err: any) {
            console.error("Error fetching from API:", err);
            throw new Error(
              err.response?.data?.message || "Failed to fetch data from API"
            );
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
        console.error("Error fetching ROCrates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRocrates();
  }, [isLoggedIn]);

  return (
    <DashboardContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      ) : (
        <ROCrateTreeView rocrates={rocrates} />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
