import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
  ModelCardProperties,
  GenericProperties,
  PropertyGroups,
  PropertyGroup,
} from "../../types/metadataPropertyLists";
import Alert from "../../../common/Alert";
import SchemaPropertiesTable from "../../components/Tables/SchemaPropertiesTable";

import {
  SectionContainer,
  SectionHeader as Header,
  DetailsGrid,
  DetailItemRow,
  DetailLabel,
  DetailValue,
  CodeBlockStyled,
  ListStyled,
  ListItemStyled,
  ProminentLink,
  BrandLogo,
  BrandedButton,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from "../../shared.styles";

import {
  CustomAlert,
  ModalTitle,
  ModalPropertyDetail,
} from "./GenericMetadataComponent.styles";

type EntityType =
  | "dataset"
  | "software"
  | "computation"
  | "schema"
  | "instrument"
  | "sample"
  | "experiment"
  | "biochementity"
  | "mlmodel";

interface GenericMetadataComponentProps {
  metadata: Metadata;
  type: EntityType;
  arkId?: string;
}

const MetricsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 8px;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  td:first-child {
    font-weight: 600;
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    width: 40%;
  }
`;

const MarkdownContainer = styled.div`
  padding: 15px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  /* Syntax highlighter handles pre and code blocks */
  pre {
    margin: 1em 0;
    border-radius: 5px;
    overflow-x: auto;
  }

  /* Inline code styles */
  code {
    background-color: #f5f5f5;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.9em;
  }

  /* Don't style code inside pre (syntax highlighter handles it) */
  pre code {
    background-color: transparent;
    padding: 0;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1em;
    margin-bottom: 0.5em;
    color: ${({ theme }) => theme.colors.text};
  }

  h2 {
    font-size: 1.5em;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    padding-bottom: 0.3em;
  }

  p {
    margin-bottom: 0.8em;
    line-height: 1.6;
  }

  ul,
  ol {
    margin-left: 20px;
    margin-bottom: 0.8em;
    line-height: 1.6;
  }

  blockquote {
    margin: 1em 0;
    padding-left: 1em;
    border-left: 3px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const CollapsibleHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: none;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  text-align: left;
`;

const CollapseHint = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const GenericMetadataComponent: React.FC<GenericMetadataComponentProps> = ({
  metadata,
  type,
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [expandedSchemaPropertyDetails, setExpandedSchemaPropertyDetails] =
    useState<any | null>(null);
  const [readmeOpen, setReadmeOpen] = useState(false);

  const feUrl = window.location.origin + "/view/";
  const apiUrl = window.API_URL;

  // Helper function to detect if content likely contains markdown
  const isMarkdownContent = (value: string): boolean => {
    const markdownPatterns = [
      /```[\s\S]*?```/, // Code blocks
      /`[^`]+`/, // Inline code
      /^\s*#+\s/m, // Headers
      /\[.+?\]\(.+?\)/, // Links
      /^\s*[-*+]\s/m, // Lists
      /^\s*\d+\.\s/m, // Numbered lists
      /\*\*.+?\*\*/, // Bold
      /__.+?__/, // Bold alternative
    ];
    return markdownPatterns.some((pattern) => pattern.test(value));
  };

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
    console.log("Determining property list for type:", type);
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
      case "mlmodel":
        return ModelCardProperties;
      default:
        return GenericProperties;
    }
  };

  const getPropertyGroups = (): PropertyGroup[] => {
    return PropertyGroups[type] || [];
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

    // Check if this is a markdown field (like usageInformation)
    const markdownKeys = new Set([
      "usageInformation",
      "hasBias",
      "intendedUseCase",
      "README",
    ]);
    const markdownPropNames = new Set([
      "Usage Information",
      "Bias",
      "Use Cases",
      "Intended Use Case",
      "README",
    ]);

    if (
      typeof value === "string" &&
      (markdownKeys.has(key) || markdownPropNames.has(propName)) &&
      isMarkdownContent(value)
    ) {
      return (
        <MarkdownContainer>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "python";

                return !inline ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {value}
          </ReactMarkdown>
        </MarkdownContainer>
      );
    }

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

  const renderPropertyGroup = (
    group: PropertyGroup,
    entity: RawGraphEntity
  ) => {
    const hasAnyValue = group.properties.some(
      (propKey) => entity[propKey] !== undefined
    );

    if (!hasAnyValue) return null;

    if (
      group.renderType === "schemaTable" &&
      group.properties[0] === "properties"
    ) {
      const propValue = entity[group.properties[0]];
      return (
        <DetailItemRow key={group.key} style={{ gridTemplateColumns: "1fr" }}>
          <DetailLabel>{group.label}</DetailLabel>
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
      );
    }

    if (group.renderType === "table") {
      const propertyList = getPropertyList();
      return (
        <DetailItemRow key={group.key} style={{ gridTemplateColumns: "1fr" }}>
          <DetailLabel>{group.label}</DetailLabel>
          <DetailValue style={{ gridColumn: "1 / -1" }}>
            <MetricsTable>
              <tbody>
                {group.properties.map((propKey) => {
                  const propValue = entity[propKey];
                  if (propValue === undefined) return null;

                  const metaProp = propertyList.find((p) => p.key === propKey);
                  const displayName = metaProp?.name || propKey;

                  return (
                    <tr key={propKey}>
                      <td>{displayName}</td>
                      <td>
                        {formatMainListValue(propKey, propValue, displayName)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </MetricsTable>
          </DetailValue>
        </DetailItemRow>
      );
    }

    return null;
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
  const propertyGroups = getPropertyGroups();

  const groupedPropertyKeys = new Set(
    propertyGroups.flatMap((group) => group.properties)
  );

  const renderedGroups = new Set<string>();

  return (
    <SectionContainer>
      <Header>{getSectionTitle()}</Header>
      <DetailsGrid>
        {propertyList.map((prop) => {
          if (prop.key === "README") {
            const propValue = entity[prop.key];
            if (propValue === undefined) return null;

            return (
              <DetailItemRow
                key={prop.key}
                style={{ gridTemplateColumns: "1fr" }}
              >
                <CollapsibleHeader
                  type="button"
                  onClick={() => setReadmeOpen((open) => !open)}
                  aria-expanded={readmeOpen}
                >
                  <span>{prop.name}</span>
                  <CollapseHint>{readmeOpen ? "Hide" : "Show"}</CollapseHint>
                </CollapsibleHeader>
                {readmeOpen && (
                  <DetailValue
                    style={{
                      gridColumn: "1 / -1",
                      maxHeight: "none",
                      overflowX: "auto",
                    }}
                  >
                    {formatMainListValue(prop.key, propValue, prop.name)}
                  </DetailValue>
                )}
              </DetailItemRow>
            );
          }

          if (groupedPropertyKeys.has(prop.key)) {
            const group = propertyGroups.find((g) =>
              g.properties.includes(prop.key)
            );
            if (group && !renderedGroups.has(group.key)) {
              renderedGroups.add(group.key);
              return renderPropertyGroup(group, entity);
            }
            return null;
          }

          const propValue = entity[prop.key];
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
