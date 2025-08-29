// src/components/MetadataDisplay/CompositionSection.tsx
import React, { useState } from "react";
import styled from "styled-components";
import {
  CompositionData,
  SubcrateSummary,
} from "../../utils/metadataProcessing";
import SubcrateCard from "../Cards/SubcrateCard";
import Alert from "../../../common/Alert";

import { SectionContainer } from "../../shared.styles";

import {
  SectionHeader,
  SectionTitle,
  SubcratesContainer,
} from "./CompositionSection.styles";

interface CompositionSectionProps {
  compositionData: CompositionData;
}

const CompositionSection: React.FC<CompositionSectionProps> = ({
  compositionData,
}) => {
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
            isLoading={false}
            error={null}
          />
        ))}
      </SubcratesContainer>
    </SectionContainer>
  );
};

export default CompositionSection;
