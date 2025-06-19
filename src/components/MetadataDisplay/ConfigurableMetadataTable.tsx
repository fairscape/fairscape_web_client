import React from "react";
import styled from "styled-components";
import { MetadataProperty } from "./metadataPropertyLists";

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

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
    }
  }
  .keyword-pill-in-table {
    display: inline-block;
    background-color: ${({ theme }) =>
      theme.colors.secondary || theme.colors.primary};
    color: white;
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: 12px;
    font-weight: 500;
    margin-right: ${({ theme }) => theme.spacing.xs};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    &:last-child {
      margin-right: 0;
    }
  }
`;

const ListStyled = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
`;

const ListItemStyled = styled.li`
  margin-bottom: 5px;
`;

interface ConfigurableMetadataTableProps {
  title: string;
  data: Record<string, any> | null;
  properties: MetadataProperty[];
}

const ConfigurableMetadataTable: React.FC<ConfigurableMetadataTableProps> = ({
  title,
  data,
  properties,
}) => {
  const feUrl = window.location.origin + "/view/";

  const formatValue = (
    key: string,
    value: any,
    propDefinition: MetadataProperty
  ): React.ReactNode => {
    if (value === null || value === undefined) return null;

    if (
      propDefinition.name.toLowerCase().includes("date") &&
      typeof value === "string"
    ) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch (e) {
        /* fall through */
      }
    }

    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string" && propDefinition.name !== "Description") {
      // Avoid Yes/No for description
      if (value.toLowerCase() === "true") return "Yes";
      if (value.toLowerCase() === "false") return "No";
    }

    if (Array.isArray(value)) {
      if (propDefinition.key === "keywords") {
        const validKeywords = value.map(String).filter((k) => k.trim() !== "");
        if (validKeywords.length === 0) return null;
        return (
          <div>
            {validKeywords.map((item, index) => (
              <span key={index} className="keyword-pill-in-table">
                {item}
              </span>
            ))}
          </div>
        );
      }
      const validItems = value
        .map((item) => formatValue(key, item, propDefinition))
        .filter((formattedItem) => formattedItem !== null);

      if (validItems.length === 0) return null;

      return (
        <ListStyled>
          {validItems.map((formattedItem, index) => (
            <ListItemStyled key={index}>{formattedItem}</ListItemStyled>
          ))}
        </ListStyled>
      );
    }

    if (typeof value === "string") {
      if (value.startsWith("ark:")) {
        return (
          <a
            href={`${feUrl}${value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        );
      }
      if (value.startsWith("http://") || value.startsWith("https://")) {
        if (propDefinition.name === "DOI" && value) {
          const doiLink = value.startsWith("doi:")
            ? `https://doi.org/${value.substring(4)}`
            : value.startsWith("https://doi.org/")
            ? value
            : `https://doi.org/${value}`;
          return (
            <a href={doiLink} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          );
        }
        return (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
      }
      if (
        propDefinition.name.toLowerCase().includes("email") &&
        value.includes("@")
      ) {
        return <a href={`mailto:${value}`}>{value}</a>;
      }
    }

    if (typeof value === "object" && value !== null && value["@id"]) {
      const formattedId = formatValue(key, value["@id"], propDefinition);
      return formattedId;
    }

    if (typeof value === "object" && value !== null) {
      return Object.keys(value).length > 0 ? JSON.stringify(value) : null;
    }

    return String(value);
  };

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const propertiesToRender = properties
    .map((prop) => {
      const propValue = data[prop.key];
      const formattedDisplayValue = formatValue(prop.key, propValue, prop);
      if (
        formattedDisplayValue === null ||
        (typeof formattedDisplayValue === "string" &&
          formattedDisplayValue.trim() === "")
      ) {
        return null;
      }
      return {
        ...prop,
        displayValue: formattedDisplayValue,
      };
    })
    .filter((prop) => prop !== null);

  if (propertiesToRender.length === 0) {
    return null;
  }

  return (
    <SectionContainer
      data-testid={`${title.toLowerCase().replace(/\s+/g, "-")}-table`}
    >
      <Header>{title}</Header>
      <DetailsGrid>
        {propertiesToRender.map((prop) => {
          if (!prop) return null;
          return (
            <DetailItemRow key={prop.key}>
              <DetailLabel>{prop.name}</DetailLabel>
              <DetailValue>{prop.displayValue}</DetailValue>
            </DetailItemRow>
          );
        })}
      </DetailsGrid>
    </SectionContainer>
  );
};

export default ConfigurableMetadataTable;
