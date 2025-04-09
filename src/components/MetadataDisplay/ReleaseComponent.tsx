// src/components/MetadataDisplay/ReleaseComponent.tsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Metadata } from "../../types";
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
import OverviewSection from "./OverviewSection";
import UseCasesSection from "./UseCasesSection";
import DistributionSection from "./DistributionSection";
import CompositionSection from "./CompositionSection";
import LoadingSpinner from "../common/LoadingSpinner";
import Alert from "../common/Alert";

const Container = styled.div`
  width: 100%;
`;

const SectionHeader = styled.div`
  margin: ${({ theme }) => theme.spacing.md} 0;
  h2 {
    font-size: 20px;
    color: ${({ theme }) => theme.colors.primary};
    margin-top: 0;
  }
`;

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

  // Processed data
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [useCasesData, setUseCasesData] = useState<UseCasesData | null>(null);
  const [distributionData, setDistributionData] =
    useState<DistributionData | null>(null);
  const [compositionData, setCompositionData] =
    useState<CompositionData | null>(null);

  useEffect(() => {
    try {
      setLoading(true);

      // Process the metadata using utility functions
      setOverviewData(processOverview(metadata));
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
      {overviewData && <OverviewSection overviewData={overviewData} />}
      {useCasesData && <UseCasesSection useCasesData={useCasesData} />}

      {compositionData && compositionData.subcrates.length > 0 && (
        <>
          <CompositionSection compositionData={compositionData} />
        </>
      )}

      {distributionData && (
        <DistributionSection distributionData={distributionData} />
      )}
    </Container>
  );
};

export default ReleaseComponent;
