import React from "react";
import { DistributionData } from "../../utils/metadataProcessing";
import MetadataField from "../Fields/MetadataField";

import { SectionContainer } from "../../shared.styles";

import {
  SectionHeader,
  SectionTitle,
  DistributionSection,
  DistributionItem,
  DistributionLabel,
  DistributionValue,
} from "./DistributionSection.styles";

interface DistributionSectionProps {
  distributionData: DistributionData;
}

const DistributionSection2: React.FC<DistributionSectionProps> = ({
  distributionData,
}) => {
  const fieldsToRender = Object.entries(distributionData)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => {
      let label = key.replace(/_/g, " ").replace(/([A-Z])/g, " $1");
      label = label.charAt(0).toUpperCase() + label.slice(1);
      if (key === "host") label = "Distribution Host";
      if (key === "license_value") label = "License";
      if (key === "release_date") label = "Release Date";
      return { key, label, value };
    });

  if (fieldsToRender.length === 0) return null;

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>Distribution Information</SectionTitle>
      </SectionHeader>
      <DistributionSection>
        {fieldsToRender.map(({ key, label, value }) => (
          <DistributionItem key={key}>
            <DistributionLabel>{label}:</DistributionLabel>
            <DistributionValue>
              {React.createElement(MetadataField, { label: "", value: value })}
            </DistributionValue>
          </DistributionItem>
        ))}
      </DistributionSection>
    </SectionContainer>
  );
};

export default DistributionSection2;
