import React from "react";
import styled from "styled-components";
import CompareSearch from "../components/Search/CompareSearch";

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const PageDescription = styled.p`
  text-align: center;
  max-width: 800px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl} auto;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CompareSearchPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle>Compare Search Methods</PageTitle>
      <PageDescription>
        Compare different search methods side-by-side to see how semantic,
        TF-IDF, and basic text search perform for the same query across the
        FAIRSCAPE ecosystem.
      </PageDescription>
      <CompareSearch />
    </PageContainer>
  );
};

export default CompareSearchPage;
