import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Metadata } from "../../types/types";
import {
  processOverview,
  processUseCases,
  processDistribution,
  processCompositionRefs,
  OverviewData,
  UseCasesData,
  DistributionData,
  CompositionData,
} from "../../utils/metadataProcessing";
import ConfigurableMetadataTable from "../../components/Tables/ConfigurableMetadataTable";
import { MetadataProperty } from "../../types/metadataPropertyLists";

import AdditionalPropertiesSection from "../../components/Sections/AdditionalPropertiesSection";
import UseCasesSection from "../../components/Sections/UseCasesSection";
import DistributionSection from "../../components/Sections/DistributionSection";
import CompositionSection from "../../components/Sections/CompositionSection";
import LoadingSpinner from "../../../common/LoadingSpinner";
import Alert from "../../../common/Alert";

const Container = styled.div`
  width: 100%;
`;

const releaseMainProperties: MetadataProperty[] = [
  { key: "id_value", name: "ARK Identifier" },
  { key: "doi", name: "DOI" },
  { key: "description", name: "Description" },
  { key: "externalUrl", name: "External URL" },
  { key: "release_date", name: "Release Date" },
  { key: "authors", name: "Author(s)" },
  { key: "publisher", name: "Publisher" },
  { key: "principal_investigator", name: "Principal Investigator" },
  { key: "contact_email", name: "Contact Email" },
  { key: "license_value", name: "License" },
  { key: "copyright", name: "Copyright" },
  { key: "content_size", name: "Content Size" },
  { key: "confidentiality_level", name: "Confidentiality Level" },
  { key: "keywords", name: "Keywords" },
  { key: "citation", name: "Citation" },
  { key: "human_subject", name: "Human Subject Data" },
  { key: "funding", name: "Funding" },
  { key: "completeness", name: "Completeness" },
  { key: "related_publications", name: "Related Publications" },
];

interface ReleaseComponentProps {
  metadata: Metadata;
  arkId?: string;
}

const ReleaseComponent: React.FC<ReleaseComponentProps> = ({
  metadata,
  arkId,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [useCasesData, setUseCasesData] = useState<UseCasesData | null>(null);
  const [distributionData, setDistributionData] =
    useState<DistributionData | null>(null);
  const [compositionData, setCompositionData] =
    useState<CompositionData | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      const processedOverview = processOverview(metadata);
      setOverviewData(processedOverview);
      setUseCasesData(processUseCases(metadata));
      setDistributionData(processDistribution(metadata));
      setCompositionData(processCompositionRefs(metadata));
      setLoading(false);
    } catch (err: any) {
      console.error("Error processing metadata:", err);
      setError(`Failed to process metadata: ${err.message}`);
      setLoading(false);
    }
  }, [metadata, arkId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert type="error" title="Error" message={error} />;

  return (
    <Container>
      {overviewData && (
        <ConfigurableMetadataTable
          title="Release Details"
          data={overviewData}
          properties={releaseMainProperties}
        />
      )}

      {overviewData && overviewData.additionalCustomProperties && (
        <AdditionalPropertiesSection
          properties={overviewData.additionalCustomProperties}
        />
      )}

      {useCasesData && <UseCasesSection useCasesData={useCasesData} />}

      {compositionData && compositionData.subcrates.length > 0 && (
        <CompositionSection compositionData={compositionData} />
      )}

      {distributionData && (
        <DistributionSection distributionData={distributionData} />
      )}
    </Container>
  );
};

export default ReleaseComponent;
