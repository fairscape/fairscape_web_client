import React from "react";
import styled from "styled-components";
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

const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 4px;
  overflow-x: auto;
  font-family: monospace;
  margin: 0;
`;

const PropertiesTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
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
  // Get the appropriate property list based on type
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

  // Get the appropriate section title based on type
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

  // Format value based on type and key
  const formatValue = (key: string, value: any): React.ReactElement => {
    if (value === null || value === undefined) {
      return <span>Not specified</span>;
    }

    // Special case for command in computation - display as code block
    if (key === "command" && type === "computation") {
      return <CodeBlock>{value}</CodeBlock>;
    }

    // Special case for properties in schema - display as table
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

    // Handle arrays
    if (Array.isArray(value)) {
      // Keywords array
      if (key === "keywords") {
        return <span>{value.join(", ")}</span>;
      }

      // Required fields array for schema
      if (key === "required" && type === "schema") {
        return <span>{value.join(", ")}</span>;
      }

      // References to other entities (IDs or objects)
      return (
        <List>
          {value.map((item, index) => (
            <li key={index}>
              {typeof item === "object" && item !== null && item["@id"]
                ? item["@id"]
                : String(item)}
            </li>
          ))}
        </List>
      );
    }

    // Handle objects (typically references)
    if (typeof value === "object" && value !== null) {
      if (value["@id"]) {
        return <span>{value["@id"]}</span>;
      }
      return <span>{JSON.stringify(value)}</span>;
    }

    // Handle download links
    if (key === "contentUrl") {
      if (value === "Embargoed") {
        return <span>Embargoed</span>;
      } else {
        return (
          <ButtonLink href={value} target="_blank" rel="noopener noreferrer">
            Download
          </ButtonLink>
        );
      }
    }

    // Format boolean values
    if (typeof value === "boolean") {
      return <span>{value ? "Yes" : "No"}</span>;
    }

    // Default: just convert to string
    return <span>{String(value)}</span>;
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

  // Treat the metadata itself as the entity
  const entity = metadata as unknown as RawGraphEntity;
  const propertyList = getPropertyList();

  return (
    <Container>
      <SummarySection>
        <SectionTitle>{getSectionTitle()}</SectionTitle>

        <SummaryList>
          {propertyList.map((prop) => {
            // Only show properties that exist in the entity
            if (entity[prop.key] !== undefined) {
              return (
                <SummaryRow key={prop.key}>
                  <SummaryLabel>{prop.name}</SummaryLabel>
                  <SummaryValue>
                    {formatValue(prop.key, entity[prop.key])}
                  </SummaryValue>
                </SummaryRow>
              );
            }
            return null;
          })}
        </SummaryList>
      </SummarySection>
    </Container>
  );
};

export default GenericMetadataComponent;
