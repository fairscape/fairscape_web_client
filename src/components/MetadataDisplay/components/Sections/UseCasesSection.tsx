import React from "react";
import { UseCasesData } from "../../utils/metadataProcessing";
import MetadataField from "../Fields/MetadataField";

import { SectionContainer } from "../../shared.styles";

import {
  SectionHeader,
  SectionTitle,
  UseCasesSection,
  UseCasesItem,
  UseCasesLabel,
  UseCasesValue,
} from "./UseCasesSection.styles";

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
