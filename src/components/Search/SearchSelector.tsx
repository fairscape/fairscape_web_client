import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const SelectorContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`;

const SearchOptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchOption = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const OptionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const OptionIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.primary};
`;

const OptionDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ActionButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const SearchSelector: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectBasicSearch = () => {
    navigate("/search/basic");
  };

  const handleSelectCompareSearch = () => {
    navigate("/compare");
  };

  return (
    <SelectorContainer>
      <Title>Choose Search Method</Title>
      <SearchOptionsContainer>
        <SearchOption onClick={handleSelectBasicSearch}>
          <OptionIcon>🔍</OptionIcon>
          <OptionTitle>Basic Search</OptionTitle>
          <OptionDescription>
            Search across the FAIRSCAPE ecosystem using a single search method.
            Choose between semantic, TF-IDF, or basic text search.
          </OptionDescription>
          <ActionButton>Select Basic Search</ActionButton>
        </SearchOption>

        <SearchOption onClick={handleSelectCompareSearch}>
          <OptionIcon>⚖️</OptionIcon>
          <OptionTitle>Compare Search Methods</OptionTitle>
          <OptionDescription>
            Run the same query with two different search methods side-by-side to
            compare results, relevance, and performance.
          </OptionDescription>
          <ActionButton>Select Compare Search</ActionButton>
        </SearchOption>
      </SearchOptionsContainer>
    </SelectorContainer>
  );
};

export default SearchSelector;
