// src/components/MetadataDisplay/MetadataField.tsx
import React from "react";
import styled from "styled-components";
import { Link as RouterLink } from "react-router-dom";

// Basic type check helpers
const isURI = (value: unknown): value is string =>
  typeof value === "string" &&
  (value.startsWith("http://") || value.startsWith("https://"));
const isARK = (value: unknown): value is string =>
  typeof value === "string" && /^ark:\d{5}\/.+/.test(value);
const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isArray = (value: unknown): value is any[] => Array.isArray(value);

const ValueContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const PublicationsList = styled.ul`
  margin-top: 5px;
  padding-left: 15px;

  li {
    margin-bottom: 8px;
  }
`;

const ValueLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const InternalLink = styled(RouterLink)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

interface MetadataFieldProps {
  label: string;
  value: any;
}

// Recursive component to render values which might be strings, links, objects, or arrays
const RenderValue: React.FC<{ value: any }> = ({ value }) => {
  if (value === null || value === undefined) {
    return <span>N/A</span>;
  }

  if (isARK(value)) {
    // Attempt to infer type for link (heuristic, might need refinement)
    const potentialType = value.includes("dataset")
      ? "Dataset"
      : value.includes("software")
      ? "Software"
      : value.includes("computation")
      ? "Computation"
      : value.includes("schema")
      ? "Schema"
      : "rocrate"; // Default guess
    return (
      <InternalLink to={`/${potentialType}/${value}`}>{value}</InternalLink>
    );
  }

  if (isURI(value)) {
    return (
      <ValueLink href={value} target="_blank" rel="noopener noreferrer">
        {value}
      </ValueLink>
    );
  }

  if (isArray(value)) {
    if (value.length === 0) return <span>None</span>;

    // For related publications, use a different style
    if (
      value[0] &&
      typeof value[0] === "string" &&
      (value[0].includes("doi.org") || value[0].includes("citation"))
    ) {
      return (
        <PublicationsList>
          {value.map((item, index) => (
            <li key={index}>
              <RenderValue value={item} />
            </li>
          ))}
        </PublicationsList>
      );
    }

    // Default array rendering
    return (
      <span>
        {value.map((item, index) => (
          <React.Fragment key={index}>
            <RenderValue value={item} />
            {index < value.length - 1 ? ", " : ""}
          </React.Fragment>
        ))}
      </span>
    );
  }

  if (isObject(value)) {
    // Special handling for objects with only @id (common in JSON-LD references)
    if (value["@id"] && Object.keys(value).length === 1) {
      return <RenderValue value={value["@id"]} />;
    }
    if (value["@id"] && value["name"] && Object.keys(value).length === 2) {
      return (
        <span>
          <RenderValue value={value["@id"]} /> ({value["name"]})
        </span>
      );
    }

    // For other objects, just show a simplified representation
    return <span>{JSON.stringify(value)}</span>;
  }

  // Default: render as string
  return <span>{String(value)}</span>;
};

const MetadataField: React.FC<MetadataFieldProps> = ({ label, value }) => {
  // If label is provided, render with label otherwise just render the value
  if (label) {
    return (
      <tr>
        <th>{label}</th>
        <td>
          <ValueContainer>
            <RenderValue value={value} />
          </ValueContainer>
        </td>
      </tr>
    );
  }

  // Just render the value when no label is provided
  return (
    <ValueContainer>
      <RenderValue value={value} />
    </ValueContainer>
  );
};

export default MetadataField;
