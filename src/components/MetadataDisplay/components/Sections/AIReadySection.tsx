import React from "react";
import { AIReadyData } from "../../utils/metadataProcessing";
import MetadataField from "../Fields/MetadataField";
import {
  SectionContainer,
  SectionHeader,
  DetailsGrid,
  DetailItemRow,
  DetailLabel,
  DetailValue,
} from "../../shared.styles";

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
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => ({
      key,
      label: AI_READY_LABELS[key] || key.replace(/([A-Z])/g, " $1").trim(),
      value,
    }));

  if (fieldsToRender.length === 0) return null;

  return (
    <SectionContainer>
      <SectionHeader>AI Ready Details</SectionHeader>
      <DetailsGrid>
        {fieldsToRender.map(({ key, label, value }) => (
          <DetailItemRow key={key}>
            <DetailLabel>{label}</DetailLabel>
            <DetailValue>
              <MetadataField label="" value={value} />
            </DetailValue>
          </DetailItemRow>
        ))}
      </DetailsGrid>
    </SectionContainer>
  );
};

export default AIReadySection;
