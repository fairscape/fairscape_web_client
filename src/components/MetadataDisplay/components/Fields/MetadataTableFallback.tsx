import React, { useState } from "react";
import styled from "styled-components";
import { Metadata } from "../../types/types";
import MetadataField from "./MetadataField";

interface MetadataTableFallbackProps {
  metadata: Metadata;
}

const MetadataTable = styled.table`
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

const MetadataTableFallback: React.FC<MetadataTableFallbackProps> = ({
  metadata,
}) => {
  // Render all top-level properties except @context
  const propertiesToRender = Object.entries(metadata).filter(
    ([key]) => key !== "@context",
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
            <MetadataField key={key} label={key} value={value} />
          ))}
        </tbody>
      </MetadataTable>
    </div>
  );
};

export default MetadataTableFallback;
