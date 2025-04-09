// src/components/MetadataDisplay/UseCasesSection.tsx
import React from "react";
import styled from "styled-components";
import { UseCasesData } from "../../utils/metadataProcessing";
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

const UseCasesSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const UseCasesItem = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const UseCasesLabel = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const UseCasesValue = styled.div``;

interface UseCasesSectionProps {
  useCasesData: UseCasesData;
}

const UseCasesSection2: React.FC<UseCasesSectionProps> = ({ useCasesData }) => {
  const fieldsToRender = Object.entries(useCasesData)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => {
      let label = key.replace(/_/g, " ").replace(/([A-Z])/g, " $1");
      label = label.charAt(0).toUpperCase() + label.slice(1);
      if (key === "intended_uses") label = "Intended Uses";
      if (key === "prohibited_uses") label = "Prohibited Uses";
      if (key === "maintenance_plan") label = "Maintenance Plan";
      return { key, label, value };
    });

  if (fieldsToRender.length === 0) return null;

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>Use Cases and Limitations</SectionTitle>
      </SectionHeader>
      <UseCasesSection>
        {fieldsToRender.map(({ key, label, value }) => (
          <UseCasesItem key={key}>
            <UseCasesLabel>{label}:</UseCasesLabel>
            <UseCasesValue>
              {React.createElement(MetadataField, { label: "", value: value })}
            </UseCasesValue>
          </UseCasesItem>
        ))}
      </UseCasesSection>
    </SectionContainer>
  );
};

export default UseCasesSection2;
