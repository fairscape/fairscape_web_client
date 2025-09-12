import React from "react";
import { RAIData } from "../../utils/metadataProcessing";
import MetadataField from "../Fields/MetadataField";

import { SectionContainer } from "../../shared.styles";

import styled from "styled-components";

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

const RAIContent = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const RAIItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  &:last-child {
    margin-bottom: 0;
  }
`;

const RAILabel = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const RAIValue = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

interface RAISectionProps {
  raiData: RAIData;
}

const RAISection: React.FC<RAISectionProps> = ({ raiData }) => {
  const fieldsToRender = Object.entries(raiData)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => {
      let label = key.replace(/([A-Z])/g, " $1").trim();
      if (key === "dataUseCases") label = "Use Cases";
      if (key === "dataLimitations") label = "Limitations";
      if (key === "dataBiases") label = "Biases";
      if (key === "dataMaintenancePlan") label = "Maintenance Plan";
      return { key, label, value };
    });

  if (fieldsToRender.length === 0) return null;

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>Responsible AI</SectionTitle>
      </SectionHeader>
      <RAIContent>
        {fieldsToRender.map(({ key, label, value }) => (
          <RAIItem key={key}>
            <RAILabel>{label}:</RAILabel>
            <RAIValue>
              {React.createElement(MetadataField, { label: "", value: value })}
            </RAIValue>
          </RAIItem>
        ))}
      </RAIContent>
    </SectionContainer>
  );
};

export default RAISection;
