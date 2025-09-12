import React from "react";
import {
  CompositionData,
  SubcrateSummary,
} from "../../utils/metadataProcessing";
import SubcrateCard from "../Cards/SubcrateCard";
import Alert from "../../../common/Alert";

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
      <>
        <SectionHeader>
          <SectionTitle>Composition</SectionTitle>
        </SectionHeader>
        <Alert
          type="info"
          message="No sub-components (parts) found in this RO-Crate."
        />
      </>
    );
  }

  return (
    <>
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
    </>
  );
};

export default CompositionSection;
