import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import axios from "axios";

// Import AuthContext
import { AuthContext } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

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

const TableContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const TableHeaderCell = styled.th<{ active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  font-weight: 600;
  position: relative;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const SortLabel = styled.div<{ direction: string }>`
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    content: "${({ direction }) => (direction === "asc" ? "▲" : "▼")}";
    display: inline-block;
    margin-left: ${({ theme }) => theme.spacing.xs};
    font-size: 0.8rem;
  }
`;

const TableRow = styled.tr`
  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }

  height: auto;
  max-height: 6em;
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  vertical-align: top;
`;

const DescriptionCell = styled(TableCell)`
  max-width: 400px;
  line-height: 1.5;
  position: relative;
  padding-right: ${({ theme }) => theme.spacing.lg};

  & > div {
    max-height: 6em; /* Approximately 4 lines */
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
  }
`;

const ActionButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ViewButton = styled(Link)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 500;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: white;
    text-decoration: none;
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

interface RoCrate {
  "@id": string;
  name: string;
  description: string;
  uploadDate: string;
  "@graph"?: any[];
  contentURL: string;
}

const Dashboard: React.FC = () => {
  const [rocrates, setRocrates] = useState<RoCrate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState({
    key: "uploadDate",
    direction: "desc",
  });

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

  const extractArkIdentifier = (url: string) => {
    const match = url.match(/(ark:.+)/);
    return match ? match[1] : "";
  };

  const sortedRocrates = React.useMemo(() => {
    let sortableItems = [...rocrates];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === "uploadDate") {
          return sortConfig.direction === "asc"
            ? new Date(a.uploadDate).getTime() -
                new Date(b.uploadDate).getTime()
            : new Date(b.uploadDate).getTime() -
                new Date(a.uploadDate).getTime();
        }

        const aValue = a[sortConfig.key as keyof RoCrate];
        const bValue = b[sortConfig.key as keyof RoCrate];

        if (aValue !== undefined && bValue !== undefined) {
          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [rocrates, sortConfig]);

  const requestSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

  return (
    <DashboardContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell onClick={() => requestSort("name")}>
                  {sortConfig.key === "name" ? (
                    <SortLabel direction={sortConfig.direction}>Name</SortLabel>
                  ) : (
                    "Name"
                  )}
                </TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell onClick={() => requestSort("uploadDate")}>
                  {sortConfig.key === "uploadDate" ? (
                    <SortLabel direction={sortConfig.direction}>
                      Upload Date
                    </SortLabel>
                  ) : (
                    "Upload Date"
                  )}
                </TableHeaderCell>
                <TableHeaderCell>Items in Crate</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <tbody>
              {sortedRocrates.length > 0 ? (
                sortedRocrates.map((rocrate) => (
                  <TableRow key={rocrate["@id"]}>
                    <TableCell
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {rocrate.name}
                    </TableCell>
                    <DescriptionCell>
                      <div title={rocrate.description}>
                        {rocrate.description}
                      </div>
                    </DescriptionCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {formatDate(rocrate.uploadDate)}
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {rocrate["@graph"]?.length || 0}
                    </TableCell>
                    <TableCell>
                      <ActionButtonContainer>
                        <ViewButton
                          to={`/view/${extractArkIdentifier(rocrate["@id"])}`}
                        >
                          View Details
                        </ViewButton>
                      </ActionButtonContainer>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} style={{ textAlign: "center" }}>
                    No ROCrates found.{" "}
                    {!isLoggedIn && "Please log in to view your ROCrates."}
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
