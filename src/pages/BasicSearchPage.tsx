import React from "react";
import styled from "styled-components";
import Search from "../components/Search/Search";

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

const BasicSearchPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle>Search FAIRSCAPE</PageTitle>
      <PageDescription>
        Search across research objects, datasets, software, and computations in
        the FAIRSCAPE ecosystem using semantic, TF-IDF, or basic text search
        methods.
      </PageDescription>
      <Search />
    </PageContainer>
  );
};

export default BasicSearchPage;
