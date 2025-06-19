import React, { useState } from "react";
import styled from "styled-components";

const API_URL = window.API_URL;

const CompareContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchBox = styled.div`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-right: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.fonts.main};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchButton = styled.button<{ isLoading?: boolean }>`
  background-color: ${({ theme, isLoading }) =>
    isLoading ? theme.colors.primaryLight : theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  font-weight: 600;
  cursor: ${({ isLoading }) => (isLoading ? "not-allowed" : "pointer")};
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const MetadataContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetadataBox = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const MetadataTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  font-size: 1.1rem;
`;

const MetadataDetails = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ErrorMetadata = styled.div`
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: #ffebee;
  border-radius: ${({ theme }) => theme.borderRadius};
  border-left: 4px solid ${({ theme }) => theme.colors.error};
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ResultsSection = styled.div``;

const ResultsTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 1.3rem;
  display: flex;
  align-items: center;
`;

const LoadingIndicator = styled.span`
  margin-left: ${({ theme }) => theme.spacing.md};
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ResultCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ResultTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  font-size: 1.15rem;
  word-break: break-word;
`;

const ResultTitleLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ResultId = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  word-break: break-all;
`;

const ResultIdLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const ResultDescription = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const ScoreBadge = styled.span<{ score: number }>`
  background-color: ${({ theme, score }) =>
    score > 0.7
      ? theme.colors.success || "#4CAF50"
      : score > 0.5
      ? theme.colors.primary
      : theme.colors.textSecondary};
  color: white;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const KeywordsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Keyword = styled.span`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: 16px;
  font-size: 0.75rem;
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const NoResults = styled.p`
  margin-top: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-style: italic;
`;

interface SearchResult {
  id: string;
  name?: string;
  description?: string;
  score: number;
  keywords?: string[];
}

interface SearchMetadataInfo {
  query?: string;
  totalResults?: number;
  timeTaken?: number;
  searchType?: string;
  error?: string;
}

const CompareSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [basicResults, setBasicResults] = useState<SearchResult[]>([]);
  const [semanticResults, setSemanticResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState({ basic: false, semantic: false });
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [basicMetadata, setBasicMetadata] = useState<SearchMetadataInfo | null>(
    null
  );
  const [semanticMetadata, setSemanticMetadata] =
    useState<SearchMetadataInfo | null>(null);

  const handleSearch = async (searchType: "basic" | "semantic") => {
    if (!query.trim()) return;

    setLoading((prev) => ({ ...prev, [searchType]: true }));
    setSearchPerformed(true);

    try {
      const response = await fetch(
        `${API_URL}/search/${searchType}?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown server error" }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      const normalizedResults = data.results.map((result: any) => ({
        ...result,
        id: result["@id"] || result.id,
      }));

      if (searchType === "basic") {
        setBasicResults(normalizedResults || []);
        setBasicMetadata({
          query: data.query,
          totalResults: data.total_results,
          timeTaken: data.time_taken_ms / 1000,
          searchType: "Basic Text Search",
        });
      } else {
        setSemanticResults(normalizedResults || []);
        setSemanticMetadata({
          query: data.query,
          totalResults: data.total_results,
          timeTaken: data.time_taken_ms / 1000,
          searchType: "Semantic Search",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      if (searchType === "basic") {
        setBasicResults([]);
        setBasicMetadata({
          error: (error as Error).message,
        });
      } else {
        setSemanticResults([]);
        setSemanticMetadata({
          error: (error as Error).message,
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, [searchType]: false }));
    }
  };

  const handleCompare = () => {
    handleSearch("basic");
    handleSearch("semantic");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCompare();
    }
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  return (
    <CompareContainer>
      <SearchBox>
        <SearchInput
          placeholder="Enter your search query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton
          onClick={handleCompare}
          disabled={loading.basic || loading.semantic || !query.trim()}
          isLoading={loading.basic || loading.semantic}
        >
          {loading.basic || loading.semantic ? <LoadingSpinner /> : "Compare"}
        </SearchButton>
      </SearchBox>

      {searchPerformed && (
        <MetadataContainer>
          <MetadataBox>
            {basicMetadata && !basicMetadata.error ? (
              <>
                <MetadataTitle>Basic Text Search</MetadataTitle>
                <MetadataDetails>
                  Results: {basicMetadata.totalResults} | Time:{" "}
                  {basicMetadata.timeTaken?.toFixed(0)}ms
                </MetadataDetails>
              </>
            ) : basicMetadata?.error ? (
              <ErrorMetadata>Error: {basicMetadata.error}</ErrorMetadata>
            ) : null}
          </MetadataBox>

          <MetadataBox>
            {semanticMetadata && !semanticMetadata.error ? (
              <>
                <MetadataTitle>Semantic Search</MetadataTitle>
                <MetadataDetails>
                  Results: {semanticMetadata.totalResults} | Time:{" "}
                  {semanticMetadata.timeTaken?.toFixed(0)}sec
                </MetadataDetails>
              </>
            ) : semanticMetadata?.error ? (
              <ErrorMetadata>Error: {semanticMetadata.error}</ErrorMetadata>
            ) : null}
          </MetadataBox>
        </MetadataContainer>
      )}

      <ResultsGrid>
        <ResultsSection>
          <ResultsTitle>
            Basic Text Search Results
            {loading.basic && <LoadingIndicator />}
          </ResultsTitle>

          {basicResults.length > 0 ? (
            basicResults.map((result, index) => (
              <ResultCard key={`basic-${result.id}`}>
                <ResultHeader>
                  <ResultTitle>
                    {index + 1}.{" "}
                    <ResultTitleLink href={`/view/${result.id}`}>
                      {result.name || "N/A"}
                    </ResultTitleLink>
                  </ResultTitle>
                  <ScoreBadge score={result.score}>
                    {formatScore(result.score)}
                  </ScoreBadge>
                </ResultHeader>

                <ResultId>
                  ID:{" "}
                  <ResultIdLink href={`/view/${result.id}`}>
                    {result.id}
                  </ResultIdLink>
                </ResultId>

                {result.description && (
                  <ResultDescription>{result.description}</ResultDescription>
                )}

                {result.keywords && result.keywords.length > 0 && (
                  <KeywordsContainer>
                    {result.keywords.map((keyword, i) => (
                      <Keyword key={i}>{keyword}</Keyword>
                    ))}
                  </KeywordsContainer>
                )}
              </ResultCard>
            ))
          ) : searchPerformed && !loading.basic ? (
            <NoResults>No results found.</NoResults>
          ) : null}
        </ResultsSection>

        <ResultsSection>
          <ResultsTitle>
            Semantic Search Results
            {loading.semantic && <LoadingIndicator />}
          </ResultsTitle>

          {semanticResults.length > 0 ? (
            semanticResults.map((result, index) => (
              <ResultCard key={`semantic-${result.id}`}>
                <ResultHeader>
                  <ResultTitle>
                    {index + 1}.{" "}
                    <ResultTitleLink href={`/view/${result.id}`}>
                      {result.name || "N/A"}
                    </ResultTitleLink>
                  </ResultTitle>
                  <ScoreBadge score={result.score}>
                    {formatScore(result.score)}
                  </ScoreBadge>
                </ResultHeader>

                <ResultId>
                  ID:{" "}
                  <ResultIdLink href={`/view/${result.id}`}>
                    {result.id}
                  </ResultIdLink>
                </ResultId>

                {result.description && (
                  <ResultDescription>{result.description}</ResultDescription>
                )}

                {result.keywords && result.keywords.length > 0 && (
                  <KeywordsContainer>
                    {result.keywords.map((keyword, i) => (
                      <Keyword key={i}>{keyword}</Keyword>
                    ))}
                  </KeywordsContainer>
                )}
              </ResultCard>
            ))
          ) : searchPerformed && !loading.semantic ? (
            <NoResults>No results found.</NoResults>
          ) : null}
        </ResultsSection>
      </ResultsGrid>
    </CompareContainer>
  );
};

export default CompareSearch;
