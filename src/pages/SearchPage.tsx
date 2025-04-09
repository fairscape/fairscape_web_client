import React from "react";
import styled from "styled-components";
import SearchSelector from "../components/Search/SearchSelector";

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

const SearchPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle>Search FAIRSCAPE</PageTitle>
      <PageDescription>
        Discover research objects, datasets, software, and computations in the
        FAIRSCAPE ecosystem.
      </PageDescription>
      <SearchSelector />
    </PageContainer>
  );
};

export default SearchPage;
