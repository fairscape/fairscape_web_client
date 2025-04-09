// src/components/MetadataDisplay/MetadataTableFallback.tsx
// (This is the renamed MetadataView.tsx from the previous step - the table-based one)
import React, { useState } from "react";
import styled from "styled-components";
import { Metadata } from "../../types"; // Adjust path
import MetadataField from "./MetadataField";
import { GenericProperties } from "./metadataPropertyLists"; // Use a generic list or process all keys

interface MetadataTableFallbackProps {
  metadata: Metadata;
}

const MetadataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  th,
  td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacing.sm}
      ${({ theme }) => theme.spacing.md};
    text-align: left;
    vertical-align: top;
  }

  th {
    background-color: ${({ theme }) => theme.colors.background};
    font-weight: 600;
    width: 25%;
  }
  td {
    word-break: break-word;
  }
`;

const MetadataTableFallback: React.FC<MetadataTableFallbackProps> = ({
  metadata,
}) => {
  // Render all top-level properties except @context
  const propertiesToRender = Object.entries(metadata).filter(
    ([key]) => key !== "@context"
  );

  return (
    <div>
      <MetadataTable>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {propertiesToRender.map(([key, value]) => (
            <MetadataField
              key={key}
              label={key} // Use the raw key as label
              value={value}
            />
          ))}
        </tbody>
      </MetadataTable>
    </div>
  );
};

export default MetadataTableFallback;
