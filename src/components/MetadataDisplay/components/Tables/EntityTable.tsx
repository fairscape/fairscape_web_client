import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const TableContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  overflow-x: auto;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  table-layout: fixed;

  thead {
    border-top: 2px solid ${({ theme }) => theme.colors.ink};
  }
`;
const TableHeader = styled.th`
  text-align: left;
  padding: 9px ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.ink3};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const TableCell = styled.td<{ isDescription?: boolean }>`
  text-align: left;
  padding: 11px ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  word-wrap: break-word;
  ${({ isDescription }) =>
    isDescription &&
    `
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    `}
`;
const TableRow = styled.tr`
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }
`;
const EmptyMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;
const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const CustomAlert = ({ message, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "20px",
      borderRadius: "5px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      zIndex: 1000,
      maxWidth: "80%",
      textAlign: "center",
    }}
  >
    <div>{message}</div>
    <button
      onClick={onClose}
      style={{
        marginTop: "10px",
        background: "none",
        border: "1px solid #721c24",
        color: "#721c24",
        padding: "5px 10px",
        borderRadius: "3px",
        cursor: "pointer",
      }}
    >
      Close
    </button>
  </div>
);

export interface EntityItem {
  name: string;
  description: string;
  contentStatus?: string;
  date?: string;
  type?: string;
  id?: string;
  contentUrl?: string | string[];
}

interface EntityTableProps {
  items: EntityItem[];
  headers: string[];
  emptyMessage?: string;
}

const EntityTable: React.FC<EntityTableProps> = ({
  items,
  headers,
  emptyMessage = "No items found.",
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const feUrl = window.location.origin + "/view/";
  const apiUrl = window.API_URL;

  const getToken = () => {
    return localStorage.getItem("token") || "";
  };

  const handleDownload = async (downloadUrl: string) => {
    const token = getToken();

    if (!token) {
      setAlertMessage("You must be logged in to download files.");
      setShowAlert(true);
      return;
    }

    try {
      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = null;
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      if (!filename) {
        const urlParts = downloadUrl.split("/");
        filename = urlParts[urlParts.length - 1];
        if (!filename.toLowerCase().endsWith(".zip")) {
          filename += ".zip";
        }
      }

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error("Download failed:", error);
      if (error.response && error.response.status === 401) {
        setAlertMessage(
          "You must be a member of the group to download this data.",
        );
      } else {
        setAlertMessage(
          `Download failed. Please try again. Error: ${error.message}`,
        );
      }
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (items.length > 0 && items[0].id) {
      console.log("First item URL:", `${feUrl}${items[0].id}`);
    }
  }, [feUrl, items]);

  if (items.length === 0) {
    return <EmptyMessage>{emptyMessage}</EmptyMessage>;
  }

  const renderContentStatus = (item: EntityItem) => {
    // Normalize URL if present
    const rawUrl = Array.isArray(item.contentUrl)
      ? item.contentUrl[0]
      : item.contentUrl;

    // Regex for API-backed downloads
    const rocrateDowloadPattern = new RegExp(`^${apiUrl}.*?download/`);

    if (item.contentStatus === "Download" && rawUrl) {
      if (rocrateDowloadPattern.test(rawUrl)) {
        return (
          <StyledLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleDownload(rawUrl);
            }}
            data-testid="entity-download-link"
            title={rawUrl}
          >
            Download
          </StyledLink>
        );
      }
      return (
        <StyledLink
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="entity-download-link"
          title={rawUrl}
        >
          Download
        </StyledLink>
      );
    }

    // When External, show a link labeled "Content" instead of the full URL
    if (item.contentStatus === "External" && rawUrl) {
      return (
        <StyledLink
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="entity-access-link"
          title={rawUrl}
        >
          Content
        </StyledLink>
      );
    }

    return item.contentStatus;
  };

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <TableHeader key={index}>{header}</TableHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const fullUrl = item.id ? `${feUrl}${item.id}` : "";

            return (
              <TableRow key={index}>
                <TableCell>
                  {item.id ? (
                    <StyledLink
                      href={fullUrl}
                      data-testid={`entity-link-${index}`}
                    >
                      {item.name}
                    </StyledLink>
                  ) : (
                    item.name
                  )}
                </TableCell>
                <TableCell isDescription={true} title={item.description}>
                  {item.description}
                </TableCell>
                <TableCell>{renderContentStatus(item)}</TableCell>
                <TableCell>{item.date || item.type}</TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </Table>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </TableContainer>
  );
};

export default EntityTable;
