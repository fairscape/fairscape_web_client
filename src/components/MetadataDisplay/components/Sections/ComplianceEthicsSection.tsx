import React from "react";
import { ComplianceEthicsData } from "../../utils/metadataProcessing";
import ConfigurableMetadataTable from "../Tables/ConfigurableMetadataTable";
import { MetadataProperty } from "../../types/metadataPropertyLists";

const complianceEthicsProperties: MetadataProperty[] = [
  { key: "ethicalReview", name: "Ethical Review" },
  { key: "confidentialityLevel", name: "Confidentiality Level" },
  { key: "irb", name: "IRB" },
  { key: "irbProtocolId", name: "IRB Protocol ID" },
  { key: "humanSubjectExemption", name: "Human Subject Exemption" },
  { key: "fdaRegulated", name: "FDA Regulated" },
  { key: "deidentified", name: "De-identified" },
  { key: "humanSubjects", name: "Human Subjects" },
  { key: "humanSubjectResearch", name: "Human Subject Research" },
  { key: "dataGovernanceCommittee", name: "Data Governance Committee" },
];

interface ComplianceEthicsSectionProps {
  data: ComplianceEthicsData;
}

const ComplianceEthicsSection: React.FC<ComplianceEthicsSectionProps> = ({
  data,
}) => {
  const hasData = Object.values(data).some(
    (v) => v !== undefined && v !== null && v !== ""
  );
  if (!hasData) return null;

  return (
    <ConfigurableMetadataTable
      title="Compliance & Ethics"
      data={data}
      properties={complianceEthicsProperties}
    />
  );
};

export default ComplianceEthicsSection;
