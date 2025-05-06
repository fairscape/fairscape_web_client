import React from "react";
import styled from "styled-components";
import { OverviewData } from "../../utils/metadataProcessing";
import MetadataField from "./MetadataField";

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SummarySection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SummaryRow = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SummaryLabel = styled.div`
  width: 220px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const SummaryValue = styled.div`
  flex: 1;
`;

interface OverviewSectionProps {
  overviewData: OverviewData;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ overviewData }) => {
  // Only filter out undefined, null, and empty strings
  const fieldsToRender = Object.entries(overviewData)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => {
      let label = key.replace(/_/g, " ").replace(/([A-Z])/g, " $1");
      label = label.charAt(0).toUpperCase() + label.slice(1);

      // Custom label mappings
      if (key === "id_value") label = "ROCrate ID";
      if (key === "release_date") label = "Release Date";
      if (key === "license_value") label = "License";
      if (key === "formatted_size") label = "Size";
      if (key === "content_size") label = "Size";
      if (key === "principal_investigator") label = "Principal Investigator";
      if (key === "contact_email") label = "Contact Email";
      if (key === "human_subject") label = "Human Subject Data";
      if (key === "confidentiality_level") label = "Confidentiality Level";
      if (key === "related_publications") label = "Related Publications";

      return { key, label, value };
    });

  // Always render the container even if we don't have many fields
  return (
    <SectionContainer>
      <SummarySection>
        <SectionTitle>Overview</SectionTitle>
        {fieldsToRender.length > 0 ? (
          fieldsToRender.map(({ key, label, value }) => (
            <SummaryRow key={key}>
              <SummaryLabel>{label}</SummaryLabel>
              <SummaryValue id={key.replace(/_/g, "-")}>
                {React.createElement(MetadataField, {
                  label: "",
                  value: value,
                })}
              </SummaryValue>
            </SummaryRow>
          ))
        ) : (
          <SummaryRow>
            <SummaryValue>No overview data available</SummaryValue>
          </SummaryRow>
        )}
      </SummarySection>
    </SectionContainer>
  );
};

export default OverviewSection;
