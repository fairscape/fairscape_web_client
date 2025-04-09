// src/components/MetadataDisplay/DistributionSection.tsx
import React from "react";
import styled from "styled-components";
import { DistributionData } from "../../utils/metadataProcessing";
import MetadataField from "./MetadataField";

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

const DistributionSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const DistributionItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const DistributionLabel = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const DistributionValue = styled.div``;

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
