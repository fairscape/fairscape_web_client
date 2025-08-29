import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { RawGraphEntity, Metadata } from "../../types/types";
import {
  DatasetProperties,
  SoftwareProperties,
  ComputationProperties,
  SchemaProperties,
  MetadataProperty,
  InstrumentProperties,
  SampleProperties,
  ExperimentProperties,
  BioChemEntityProperties,
  GenericProperties,
} from "../../types/metadataPropertyLists";
import Alert from "../../../common/Alert";
import SchemaPropertiesTable from "../../components/Tables/SchemaPropertiesTable";

const SectionContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background || "#ffffff"};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) =>
    theme.shadows?.subtle || "0 2px 4px rgba(0,0,0,0.06)"};
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#e0e0e0"};
`;

const Header = styled.h2`
  font-size: 22px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 2px solid
    ${({ theme }) => theme.colors.secondary || theme.colors.primary};
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2px;
`;

const DetailItemRow = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 220px) 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  align-items: start;
  border-bottom: 1px solid
    ${({ theme }) => theme.colors.borderLight || "#f0f0f0"};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.sm} 0;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  padding-right: ${({ theme }) => theme.spacing.sm};
  line-height: 1.5;
  word-break: break-word;

  @media (max-width: 768px) {
    margin-bottom: 2px;
    padding-right: 0;
  }
`;

const DetailValue = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) =>
    theme.colors.textSlightlyLighter || theme.colors.text};
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
  padding: 1px 0;
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const CodeBlockStyled = styled.pre`
  background-color: ${({ theme }) => theme.colors.backgroundAlt || "#f7f7f7"};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow-x: auto;
  font-family: monospace;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.9em;
  border: 1px solid ${({ theme }) => theme.colors.borderLight || "#e0e0e0"};
`;

const ListStyled = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
`;

const ListItemStyled = styled.li`
  margin-bottom: 5px;
`;

const ProminentLink = styled.a`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary || "#ff8c00"} !important;
  text-decoration: none !important;
  display: inline-block;
  padding: 3px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.secondary || "#ff8c00"};

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary || "#ff8c00"};
    color: white !important;
    text-decoration: none !important;
  }

  &.embargoed {
    color: ${({ theme }) =>
      theme.colors.textSlightlyLighter || "#757575"} !important;
    border-color: ${({ theme }) => theme.colors.border || "#ccc"} !important;
    background-color: transparent !important;
    font-style: italic;
    cursor: not-allowed;
    padding: 3px 6px;
    &:hover {
      color: ${({ theme }) =>
        theme.colors.textSlightlyLighter || "#757575"} !important;
      background-color: transparent !important;
    }
  }
`;

const BrandLogo = styled.img`
  height: 24px; /* Increased from 18px to make it more prominent */
  width: auto;
  margin-right: 8px;
`;

const BrandedButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px; /* Adjusted vertical padding for the taller logo */
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  /* Specific styles for Kaggle (no changes here) */
  &.kaggle {
    background-color: #ffffff;
    color: #20beff !important;
    border: 1px solid #20beff;

    &:hover {
      background-color: #f0faff;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }
  }
`;

const CustomAlert = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  max-width: 800px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
`;

const ModalPropertyDetail = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};

  strong {
    display: block;
    margin-bottom: 4px;
    color: ${({ theme }) => theme.colors.primary};
  }

  p,
  pre,
  ul {
    margin: 0;
    word-break: break-word;
    white-space: pre-wrap;
  }

  pre {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: 4px;
    overflow-x: auto;
  }

  ul {
    padding-left: 20px;
  }
`;

type EntityType =
  | "dataset"
  | "software"
  | "computation"
  | "schema"
  | "instrument"
  | "sample"
  | "experiment"
  | "biochementity";

interface GenericMetadataComponentProps {
  metadata: Metadata;
  type: EntityType;
  arkId?: string;
}

const GenericMetadataComponent: React.FC<GenericMetadataComponentProps> = ({
  metadata,
  type,
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [expandedSchemaPropertyDetails, setExpandedSchemaPropertyDetails] =
    useState<any | null>(null);

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
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      const contentDisposition = response.headers["content-disposition"];
      let filename = "download";
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches?.[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      } else {
        if (downloadUrl.includes(".zip/")) {
          const innerFilePath = downloadUrl.split(".zip/")[1];
          filename = innerFilePath?.split("/").pop() || "download";
        } else {
          const urlParts = downloadUrl.split("/");
          filename = urlParts[urlParts.length - 1] || "download";
        }
      }
      const extensionMap: { [key: string]: string } = {
        "application/zip": ".zip",
        "text/csv": ".csv",
        "application/json": ".json",
        "text/plain": ".txt",
        "application/pdf": ".pdf",
      };
      const expectedExtension = extensionMap[contentType] || "";
      if (
        expectedExtension &&
        !filename.toLowerCase().endsWith(expectedExtension)
      ) {
        filename += expectedExtension;
      }
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error("Download failed:", error);
      setAlertMessage(
        error.response?.data?.message || error.message || "Download failed."
      );
      setShowAlert(true);
    }
  };

  const getPropertyList = (): MetadataProperty[] => {
    switch (type) {
      case "dataset":
        return DatasetProperties;
      case "software":
        return SoftwareProperties;
      case "computation":
        return ComputationProperties;
      case "schema":
        return SchemaProperties;
      case "instrument":
        return InstrumentProperties;
      case "sample":
        return SampleProperties;
      case "experiment":
        return ExperimentProperties;
      case "biochementity":
        return BioChemEntityProperties;
      default:
        return GenericProperties;
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
      case "instrument":
        return "Instrument Details";
      case "sample":
        return "Sample Details";
      case "experiment":
        return "Experiment Details";
      case "biochementity":
        return "BioChemEntity Details";
      default:
        return "Metadata Details";
    }
  };

  const renderLinkValue = (
    value: string | { "@id": string },
    index?: number,
    isArk?: boolean
  ) => {
    const id = typeof value === "object" ? value["@id"] : value;
    if (!id || typeof id !== "string")
      return <span key={index}>{String(id)}</span>;

    if (isArk || id.startsWith("ark:")) {
      const fullUrl = id.startsWith("ark:") ? `${feUrl}${id}` : id;
      return (
        <a
          href={fullUrl}
          key={index ?? id}
          target="_blank"
          rel="noopener noreferrer"
        >
          {id}
        </a>
      );
    }
    if (id.startsWith("http://") || id.startsWith("https://")) {
      return (
        <a
          href={id}
          key={index ?? id}
          target="_blank"
          rel="noopener noreferrer"
        >
          {id}
        </a>
      );
    }
    return <span key={index ?? id}>{id}</span>;
  };

  const handleExpandSchemaProperty = (propDetails: any, propName: string) => {
    setExpandedSchemaPropertyDetails({ name: propName, ...propDetails });
  };

  const handleCloseModal = () => {
    setExpandedSchemaPropertyDetails(null);
  };

  const renderModalValueContent = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return <p>Not specified</p>;
    if (
      typeof value === "string" &&
      (value.startsWith("http://") || value.startsWith("https://"))
    ) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    }
    if (
      (typeof value === "string" && value.startsWith("ark:")) ||
      (typeof value === "object" && value !== null && value["@id"])
    ) {
      return renderLinkValue(value, undefined, true);
    }
    if (Array.isArray(value)) {
      const allPrimitivesOrSimpleLinks = value.every(
        (item) =>
          typeof item !== "object" ||
          item === null ||
          (typeof item === "string" &&
            (item.startsWith("ark:") || item.startsWith("http"))) ||
          (typeof item === "object" && item !== null && item["@id"])
      );
      if (allPrimitivesOrSimpleLinks) {
        return (
          <ListStyled>
            {value.map((item, index) => (
              <ListItemStyled key={index}>
                {renderModalValueContent(item)}
              </ListItemStyled>
            ))}
          </ListStyled>
        );
      }
      try {
        return (
          <CodeBlockStyled>{JSON.stringify(value, null, 2)}</CodeBlockStyled>
        );
      } catch (e) {
        return <p>[Array]</p>;
      }
    }
    if (typeof value === "object" && value !== null) {
      try {
        return (
          <CodeBlockStyled>{JSON.stringify(value, null, 2)}</CodeBlockStyled>
        );
      } catch (e) {
        return <p>[Object]</p>;
      }
    }
    if (typeof value === "boolean") return <p>{value ? "Yes" : "No"}</p>;
    return <p>{String(value)}</p>;
  };

  const formatMainListValue = (
    key: string,
    value: any,
    propName: string
  ): React.ReactNode => {
    if (value === null || value === undefined) return "Not specified";

    if (key === "notebookUrl" && typeof value === "string") {
      return (
        <BrandedButton
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="kaggle"
        >
          <BrandLogo src="/icons/kaggle.svg" alt="Kaggle Logo" />
          Open Notebook
        </BrandedButton>
      );
    }

    if (
      propName === "External Link" &&
      typeof value === "string" &&
      (value.startsWith("http") || value.startsWith("https://"))
    ) {
      return (
        <ProminentLink href={value} target="_blank" rel="noopener noreferrer">
          Open Link
        </ProminentLink>
      );
    }
    if (propName === "Download Link") {
      if (value === "Embargoed") {
        return (
          <ProminentLink
            href="#"
            onClick={(e) => e.preventDefault()}
            className="embargoed"
          >
            Download Embargoed
          </ProminentLink>
        );
      }

      if (typeof value === "string" && value) {
        const rocrateApiDownloadPattern = new RegExp(`^${apiUrl}.*?download/`);
        if (rocrateApiDownloadPattern.test(value)) {
          return (
            <ProminentLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleDownload(value);
              }}
            >
              Download (API)
            </ProminentLink>
          );
        } else if (value.startsWith("http")) {
          return (
            <ProminentLink
              href={value}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download File
            </ProminentLink>
          );
        }
      }
    }

    if (key === "command" && type === "computation")
      return <CodeBlockStyled>{value}</CodeBlockStyled>;
    if (key === "properties" && type === "schema") return null;

    if (key === "identifier" && type === "biochementity") {
      if (Array.isArray(value)) {
        return (
          <ListStyled>
            {value.map((item, index) => {
              if (typeof item === "object" && item.propertyID && item.value) {
                return (
                  <ListItemStyled key={index}>
                    <strong>{item.propertyID}:</strong> {item.value}
                  </ListItemStyled>
                );
              }
              return (
                <ListItemStyled key={index}>
                  {typeof item === "object" ? JSON.stringify(item) : item}
                </ListItemStyled>
              );
            })}
          </ListStyled>
        );
      }
    }

    if (Array.isArray(value)) {
      if (key === "keywords" || (key === "required" && type === "schema")) {
        return value.map((k, i) => (
          <span key={i} style={{ marginRight: "5px", display: "inline-block" }}>
            {k}
            {i < value.length - 1 ? "," : ""}
          </span>
        ));
      }
      return (
        <ListStyled>
          {value.map((item, index) => (
            <ListItemStyled key={index}>
              {renderLinkValue(
                item,
                index,
                item?.startsWith && item.startsWith("ark:")
              )}
            </ListItemStyled>
          ))}
        </ListStyled>
      );
    }
    if (typeof value === "object" && value !== null) {
      if (value["@id"])
        return renderLinkValue(
          value["@id"],
          undefined,
          value["@id"].startsWith("ark:")
        );
      try {
        return JSON.stringify(value);
      } catch (e) {
        return "[Object]";
      }
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return renderLinkValue(
      String(value),
      undefined,
      key === "@id" || (typeof value === "string" && value.startsWith("ark:"))
    );
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
    <SectionContainer>
      <Header>{getSectionTitle()}</Header>
      <DetailsGrid>
        {propertyList.map((prop) => {
          const propValue = entity[prop.key];

          if (prop.key === "properties" && type === "schema") {
            return propValue !== undefined ? (
              <DetailItemRow
                key={prop.key}
                style={{ gridTemplateColumns: "1fr" }}
              >
                <DetailLabel>{prop.name}</DetailLabel>
                <DetailValue
                  style={{
                    maxHeight: "none",
                    overflow: "visible",
                    gridColumn: "1 / -1",
                  }}
                >
                  <SchemaPropertiesTable
                    properties={propValue}
                    onExpandProperty={handleExpandSchemaProperty}
                  />
                </DetailValue>
              </DetailItemRow>
            ) : null;
          }

          return propValue !== undefined ? (
            <DetailItemRow key={prop.key}>
              <DetailLabel>{prop.name}</DetailLabel>
              <DetailValue>
                {formatMainListValue(prop.key, propValue, prop.name)}
              </DetailValue>
            </DetailItemRow>
          ) : null;
        })}
      </DetailsGrid>

      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      {expandedSchemaPropertyDetails && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={handleCloseModal}>×</ModalCloseButton>
            <ModalTitle>
              Schema Property Details: {expandedSchemaPropertyDetails.name}
            </ModalTitle>
            {Object.entries(expandedSchemaPropertyDetails).map(([key, value]) =>
              key === "name" ? null : (
                <ModalPropertyDetail key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                  {renderModalValueContent(value)}
                </ModalPropertyDetail>
              )
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </SectionContainer>
  );
};

export default GenericMetadataComponent;
