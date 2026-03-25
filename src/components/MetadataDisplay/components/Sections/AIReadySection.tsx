import React from "react";
import { AIReadyData } from "../../utils/metadataProcessing";
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

const Content = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const Item = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Value = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
`;

const AI_READY_LABELS: Record<string, string> = {
  dataUseCases: "Use Cases",
  dataLimitations: "Limitations",
  dataBiases: "Biases",
  dataReleaseMaintenancePlan: "Maintenance Plan",
  dataCollection: "Data Collection",
  dataCollectionType: "Collection Type",
  dataCollectionMissingData: "Missing Data",
  dataCollectionRawData: "Raw Data",
  dataCollectionTimeframe: "Collection Timeframe",
  dataImputationProtocol: "Imputation Protocol",
  dataManipulationProtocol: "Manipulation Protocol",
  dataPreprocessingProtocol: "Preprocessing Protocol",
  dataAnnotationProtocol: "Annotation Protocol",
  dataAnnotationPlatform: "Annotation Platform",
  dataAnnotationAnalysis: "Annotation Analysis",
  personalSensitiveInformation: "Personal/Sensitive Information",
  dataSocialImpact: "Social Impact",
  annotationsPerItem: "Annotations Per Item",
  machineAnnotationTools: "Machine Annotation Tools",
  completeness: "Completeness",
  prohibitedUses: "Prohibited Uses",
  addressingGaps: "Addressing Gaps",
  dataAnomalies: "Data Anomalies",
  contentWarning: "Content Warning",
  informedConsent: "Informed Consent",
  atRiskPopulations: "At-Risk Populations",
};

interface AIReadySectionProps {
  data: AIReadyData;
}

const AIReadySection: React.FC<AIReadySectionProps> = ({ data }) => {
  const fieldsToRender = Object.entries(data)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => ({
      key,
      label: AI_READY_LABELS[key] || key.replace(/([A-Z])/g, " $1").trim(),
      value,
    }));

  if (fieldsToRender.length === 0) return null;

  return (
    <SectionContainer>
      <SectionHeader>
        <SectionTitle>AI Ready Details</SectionTitle>
      </SectionHeader>
      <Content>
        {fieldsToRender.map(({ key, label, value }) => (
          <Item key={key}>
            <Label>{label}:</Label>
            <Value>
              {React.createElement(MetadataField, { label: "", value: value })}
            </Value>
          </Item>
        ))}
      </Content>
    </SectionContainer>
  );
};

export default AIReadySection;
