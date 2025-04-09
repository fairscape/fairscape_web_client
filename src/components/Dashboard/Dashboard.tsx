import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import axios from "axios";

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

const EvidenceButton = styled(Link)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 500;
  text-decoration: none;
  font-size: 0.9rem;
  margin-right: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryLight};
    color: white;
    text-decoration: none;
  }
`;

const DownloadButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background-color: white;
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: white;
  }
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
  const [sortConfig, setSortConfig] = useState({
    key: "uploadDate",
    direction: "desc",
  });

  useEffect(() => {
    const fetchRocrates = async () => {
      setLoading(true);
      try {
        // Comment out the API call but keep it for future reference
        /*
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(`${API_URL}/rocrate`, {
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setRocrates(data.rocrates);
        */

        // Instead, read from local JSON file
        const response = await axios.get("/data/dashboard.json");
        setRocrates(response.data.rocrates);
      } catch (error) {
        console.error("Error fetching ROCrates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRocrates();
  }, []);

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

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
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

  const handleDownload = async (downloadUrl: string) => {
    try {
      // Comment out the API call but keep it for future reference
      /*
      const token = localStorage.getItem("token");
      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", "rocrate.zip");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      */

      // For now, just log the download attempt
      console.log("Download requested for:", downloadUrl);
      alert(
        "Download functionality is mocked. Would download from: " + downloadUrl
      );
    } catch (error) {
      console.error("Download failed:", error);
      alert(
        `Download failed. Please try again. Error: ${(error as Error).message}`
      );
    }
  };

  return (
    <DashboardContainer>
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
              {sortedRocrates.map((rocrate) => (
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
                    <div title={rocrate.description}>{rocrate.description}</div>
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
                        to={`/view/rocrate/${extractArkIdentifier(
                          rocrate["@id"]
                        )}`}
                      >
                        View Details
                      </ViewButton>
                    </ActionButtonContainer>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
