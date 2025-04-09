// src/components/MetadataDisplay/CompositionSection.tsx
import React, { useState } from "react";
import styled from "styled-components";
import {
  CompositionData,
  SubcrateSummary,
} from "../../utils/metadataProcessing";
import SubcrateCard from "./SubcrateCard";
import Alert from "../common/Alert";

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeader = styled.div`
  margin: 25px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.primary};
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: 0;
`;

const SubcratesContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

interface CompositionSectionProps {
  compositionData: CompositionData;
}

const CompositionSection: React.FC<CompositionSectionProps> = ({
  compositionData,
}) => {
  // With our new approach, we don't need to fetch additional data
  // Just use the data that's already been processed from the main graph
  const subcrates = compositionData.subcrates;

  if (!subcrates || subcrates.length === 0) {
    return (
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>Composition</SectionTitle>
        </SectionHeader>
        <Alert
          type="info"
          message="No sub-components (parts) found in this RO-Crate."
        />
      </SectionContainer>
    );
  }

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>Composition (Datasets {subcrates.length})</SectionTitle>
      </SectionHeader>
      <SubcratesContainer>
        {subcrates.map((subcrate) => (
          <SubcrateCard
            key={subcrate.id}
            subcrate={subcrate}
            isLoading={false} // No longer doing any loading
            error={null} // No fetching means no errors
          />
        ))}
      </SubcratesContainer>
    </SectionContainer>
  );
};

export default CompositionSection;
