import React from "react";
import styled from "styled-components";
import { MetadataProperty } from "../../types/metadataPropertyLists";

const SectionContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Header = styled.h2`
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -0.015em;
  color: ${({ theme }) => theme.colors.ink};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 2px solid ${({ theme }) => theme.colors.ink};
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
`;

const DetailItemRow = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 200px) 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: 13px 0;
  align-items: baseline;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

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
  font-size: 13px;
  font-weight: 550;
  color: ${({ theme }) => theme.colors.ink3};
  padding-right: ${({ theme }) => theme.spacing.sm};
  line-height: 1.5;
  word-break: break-word;

  @media (max-width: 768px) {
    margin-bottom: 2px;
    padding-right: 0;
  }
`;

const DetailValue = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.ink};
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
  .keyword-pill-in-table {
    display: inline-block;
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textSecondary};
    background-color: ${({ theme }) => theme.colors.background};
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 2px 8px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
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

const BrandLogo = styled.img`
  height: 24px;
  width: auto;
  margin-right: 8px;
`;

const BrandedButton = styled.a`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  text-decoration: none !important;
  transition: background-color 0.2s ease-in-out;

  &.kaggle {
    background-color: #ffffff;
    color: #20beff !important;
    border: 1px solid #20beff;

    &:hover {
      background-color: #f0faff;
    }
  }
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
    propDefinition: MetadataProperty,
  ): React.ReactNode => {
    if (value === null || value === undefined) return null;
    if (key === "kaggleUrl" && typeof value === "string") {
      return (
        <BrandedButton
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="kaggle"
        >
          <BrandLogo src="/icons/kaggle.svg" alt="Kaggle Logo" />
          View on Kaggle
        </BrandedButton>
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

    if (
      key === "authors" &&
      typeof value === "object" &&
      value !== null &&
      "name" in value &&
      !Array.isArray(value)
    ) {
      const author = value as { name: string; id?: string };
      if (author.id) {
        const href = author.id.startsWith("ark:")
          ? `${feUrl}${author.id}`
          : author.id;
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {author.name}
          </a>
        );
      }
      return author.name;
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
