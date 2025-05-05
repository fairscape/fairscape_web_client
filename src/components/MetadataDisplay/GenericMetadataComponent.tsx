import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { RawGraphEntity, Metadata } from "../../types";
import {
  DatasetProperties,
  SoftwareProperties,
  ComputationProperties,
  SchemaProperties,
} from "./metadataPropertyLists";
import Alert from "../common/Alert";

const Container = styled.div`
  width: 100%;
`;

const SummarySection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SummaryList = styled.div`
  padding-right: ${({ theme }) => theme.spacing.sm};
`;

const SummaryRow = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SummaryLabel = styled.div`
  width: 220px;
  min-width: 220px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 4px;
  }
`;

const SummaryValue = styled.div`
  flex: 1;
  max-height: 300px;
  overflow: auto;
  word-wrap: break-word; /* Added for better wrapping */
  word-break: break-all; /* Added for better wrapping */

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const List = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const ListItem = styled.li`
  margin-bottom: 4px;
`;

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  margin: 0;
  white-space: pre-wrap; /* Allow wrapping within code block */
  word-break: break-all; /* Break long words/lines */
`;

const PropertiesTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: top; /* Align content to top */
  }

  th {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    font-weight: bold;
  }
`;

const ButtonLink = styled.a`
  display: inline-block;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 4px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
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

type EntityType = "dataset" | "software" | "computation" | "schema";

interface GenericMetadataComponentProps {
  metadata: Metadata;
  type: EntityType;
  arkId?: string;
}

const GenericMetadataComponent: React.FC<GenericMetadataComponentProps> = ({
  metadata,
  type,
  arkId,
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const feUrl =
    import.meta.env.VITE_FAIRSCAPE_FE_URL || "http://localhost:5173/view/";
  const apiUrl =
    import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

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
          "You must be a member of the group to download this data."
        );
      } else {
        setAlertMessage(
          `Download failed. Please try again. Error: ${error.message}`
        );
      }
      setShowAlert(true);
    }
  };

  const getPropertyList = () => {
    switch (type) {
      case "dataset":
        return DatasetProperties;
      case "software":
        return SoftwareProperties;
      case "computation":
        return ComputationProperties;
      case "schema":
        return SchemaProperties;
      default:
        return [];
    }
  };

  const getSectionTitle = () => {
    switch (type) {
      case "dataset":
        return "Dataset Details";
      case "software":
        return "Software Details";
      case "computation":
        return "Computation Details";
      case "schema":
        return "Schema Details";
      default:
        return "Metadata Details";
    }
  };

  const renderArkLink = (arkId: string, index?: number) => {
    if (typeof arkId === "string" && arkId.startsWith("ark:")) {
      const fullUrl = `${feUrl}${arkId}`;
      return (
        <StyledLink
          href={fullUrl}
          key={index ?? arkId}
          data-testid={`ark-link-${arkId}`}
        >
          {arkId}
        </StyledLink>
      );
    }
    return <span key={index ?? arkId}>{String(arkId)}</span>;
  };

  const formatValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span>Not specified</span>;
    }

    if (key === "command" && type === "computation") {
      return <CodeBlock>{value}</CodeBlock>;
    }

    if (
      key === "properties" &&
      type === "schema" &&
      typeof value === "object"
    ) {
      return (
        <PropertiesTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(value).map(
              ([propName, propDetails]: [string, any]) => (
                <tr key={propName}>
                  <td>{propName}</td>
                  <td>{propDetails.type || "N/A"}</td>
                  <td>{propDetails.description || "No description"}</td>
                </tr>
              )
            )}
          </tbody>
        </PropertiesTable>
      );
    }

    if (Array.isArray(value)) {
      if (key === "keywords" || (key === "required" && type === "schema")) {
        return <span>{value.join(", ")}</span>;
      }

      return (
        <List>
          {value.map((item, index) => (
            <ListItem key={index}>
              {typeof item === "object" && item !== null && item["@id"]
                ? renderArkLink(item["@id"], index)
                : renderArkLink(item, index)}
            </ListItem>
          ))}
        </List>
      );
    }

    if (typeof value === "object" && value !== null) {
      if (value["@id"]) {
        return renderArkLink(value["@id"]);
      }
      try {
        return <span>{JSON.stringify(value)}</span>;
      } catch (e) {
        return <span>[Object]</span>;
      }
    }

    if (key === "contentUrl") {
      if (value === "Embargoed") {
        return <span>Embargoed</span>;
      } else {
        const rocrateDowloadPattern = new RegExp(`^${apiUrl}.*?download/`);
        if (rocrateDowloadPattern.test(value)) {
          return (
            <ButtonLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleDownload(value);
              }}
            >
              Download
            </ButtonLink>
          );
        } else {
          return (
            <ButtonLink href={value} target="_blank" rel="noopener noreferrer">
              Download
            </ButtonLink>
          );
        }
      }
    }

    if (typeof value === "boolean") {
      return <span>{value ? "Yes" : "No"}</span>;
    }

    return renderArkLink(String(value));
  };

  if (!metadata) {
    return (
      <Alert
        type="info"
        title="No Data"
        message={`Could not load ${type} information.`}
      />
    );
  }

  const entity = metadata as unknown as RawGraphEntity;
  const propertyList = getPropertyList();

  return (
    <Container>
      <SummarySection>
        <SectionTitle>{getSectionTitle()}</SectionTitle>

        <SummaryList>
          {propertyList.map((prop) => {
            const propValue = entity[prop.key];
            if (propValue !== undefined) {
              return (
                <SummaryRow key={prop.key}>
                  <SummaryLabel>{prop.name}</SummaryLabel>
                  <SummaryValue>
                    {formatValue(prop.key, propValue)}
                  </SummaryValue>
                </SummaryRow>
              );
            }
            return null;
          })}
        </SummaryList>
      </SummarySection>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </Container>
  );
};

export default GenericMetadataComponent;
