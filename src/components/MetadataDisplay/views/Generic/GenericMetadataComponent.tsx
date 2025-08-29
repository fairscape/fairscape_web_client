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
