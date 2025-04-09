import React, { useState } from "react";
import styled from "styled-components";

// Use a different API URL than your main app
const SEARCH_API_URL =
  import.meta.env.VITE_SEARCH_API_URL || "http://localhost:5050/api";

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

const MethodsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchMethodsContainer = styled.fieldset`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.md};
`;

const SearchMethodsLegend = styled.legend`
  padding: 0 ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const RadioGroupContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const RadioInput = styled.input`
  cursor: pointer;
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
`;

const ResultId = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ResultDescription = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const ScoreBadge = styled.span<{ score: number }>`
  background-color: ${({ theme, score }) =>
    score > 0.7
      ? theme.colors.success
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
  const [leftSearchType, setLeftSearchType] = useState("semantic");
  const [rightSearchType, setRightSearchType] = useState("tfidf");
  const [leftResults, setLeftResults] = useState<SearchResult[]>([]);
  const [rightResults, setRightResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState({ left: false, right: false });
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [leftMetadata, setLeftMetadata] = useState<SearchMetadataInfo | null>(
    null
  );
  const [rightMetadata, setRightMetadata] = useState<SearchMetadataInfo | null>(
    null
  );

  const handleSearch = async (side: "left" | "right") => {
    if (!query.trim()) return;

    setLoading((prev) => ({ ...prev, [side]: true }));
    setSearchPerformed(true);

    const searchType = side === "left" ? leftSearchType : rightSearchType;

    try {
      const response = await fetch(
        `${SEARCH_API_URL}/search?query=${encodeURIComponent(
          query
        )}&type=${searchType}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (side === "left") {
        setLeftResults(data.results || []);
        setLeftMetadata({
          query: data.query,
          totalResults: data.total_results,
          timeTaken: data.time_taken,
          searchType: data.search_type,
        });
      } else {
        setRightResults(data.results || []);
        setRightMetadata({
          query: data.query,
          totalResults: data.total_results,
          timeTaken: data.time_taken,
          searchType: data.search_type,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      if (side === "left") {
        setLeftResults([]);
        setLeftMetadata({
          error: (error as Error).message,
        });
      } else {
        setRightResults([]);
        setRightMetadata({
          error: (error as Error).message,
        });
      }
    } finally {
      setLoading((prev) => ({ ...prev, [side]: false }));
    }
  };

  const handleCompare = () => {
    handleSearch("left");
    handleSearch("right");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCompare();
    }
  };

  const formatSearchType = (type?: string) => {
    if (!type) return "";

    switch (type) {
      case "semantic":
        return "Semantic Search";
      case "tfidf":
        return "TF-IDF Search";
      case "basic":
        return "Basic Text Search";
      default:
        return type;
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
          disabled={loading.left || loading.right || !query.trim()}
          isLoading={loading.left || loading.right}
        >
          {loading.left || loading.right ? <LoadingSpinner /> : "Compare"}
        </SearchButton>
      </SearchBox>

      <MethodsGrid>
        <SearchMethodsContainer>
          <SearchMethodsLegend>Left Search Method</SearchMethodsLegend>
          <RadioGroupContainer>
            <RadioLabel>
              <RadioInput
                type="radio"
                name="left-search-type"
                value="semantic"
                checked={leftSearchType === "semantic"}
                onChange={(e) => setLeftSearchType(e.target.value)}
              />
              Semantic
            </RadioLabel>
            <RadioLabel>
              <RadioInput
                type="radio"
                name="left-search-type"
                value="tfidf"
                checked={leftSearchType === "tfidf"}
                onChange={(e) => setLeftSearchType(e.target.value)}
              />
              TF-IDF
            </RadioLabel>
            <RadioLabel>
              <RadioInput
                type="radio"
                name="left-search-type"
                value="basic"
                checked={leftSearchType === "basic"}
                onChange={(e) => setLeftSearchType(e.target.value)}
              />
              Basic
            </RadioLabel>
          </RadioGroupContainer>
        </SearchMethodsContainer>

        <SearchMethodsContainer>
          <SearchMethodsLegend>Right Search Method</SearchMethodsLegend>
          <RadioGroupContainer>
            <RadioLabel>
              <RadioInput
                type="radio"
                name="right-search-type"
                value="semantic"
                checked={rightSearchType === "semantic"}
                onChange={(e) => setRightSearchType(e.target.value)}
              />
              Semantic
            </RadioLabel>
            <RadioLabel>
              <RadioInput
                type="radio"
                name="right-search-type"
                value="tfidf"
                checked={rightSearchType === "tfidf"}
                onChange={(e) => setRightSearchType(e.target.value)}
              />
              TF-IDF
            </RadioLabel>
            <RadioLabel>
              <RadioInput
                type="radio"
                name="right-search-type"
                value="basic"
                checked={rightSearchType === "basic"}
                onChange={(e) => setRightSearchType(e.target.value)}
              />
              Basic
            </RadioLabel>
          </RadioGroupContainer>
        </SearchMethodsContainer>
      </MethodsGrid>

      {searchPerformed && (
        <MetadataContainer>
          <MetadataBox>
            {leftMetadata && !leftMetadata.error ? (
              <>
                <MetadataTitle>
                  {formatSearchType(leftMetadata.searchType)}
                </MetadataTitle>
                <MetadataDetails>
                  Results: {leftMetadata.totalResults} | Time:{" "}
                  {leftMetadata.timeTaken?.toFixed(3)}s
                </MetadataDetails>
              </>
            ) : leftMetadata?.error ? (
              <ErrorMetadata>Error: {leftMetadata.error}</ErrorMetadata>
            ) : null}
          </MetadataBox>

          <MetadataBox>
            {rightMetadata && !rightMetadata.error ? (
              <>
                <MetadataTitle>
                  {formatSearchType(rightMetadata.searchType)}
                </MetadataTitle>
                <MetadataDetails>
                  Results: {rightMetadata.totalResults} | Time:{" "}
                  {rightMetadata.timeTaken?.toFixed(3)}s
                </MetadataDetails>
              </>
            ) : rightMetadata?.error ? (
              <ErrorMetadata>Error: {rightMetadata.error}</ErrorMetadata>
            ) : null}
          </MetadataBox>
        </MetadataContainer>
      )}

      <ResultsGrid>
        <ResultsSection>
          <ResultsTitle>
            {formatSearchType(leftSearchType)} Results
            {loading.left && <LoadingIndicator />}
          </ResultsTitle>

          {leftResults.length > 0 ? (
            leftResults.map((result, index) => (
              <ResultCard key={`left-${result.id}`}>
                <ResultHeader>
                  <ResultTitle>
                    {index + 1}. {result.name || result.id}
                  </ResultTitle>
                  <ScoreBadge score={result.score}>
                    {formatScore(result.score)}
                  </ScoreBadge>
                </ResultHeader>

                <ResultId>ID: {result.id}</ResultId>

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
          ) : searchPerformed && !loading.left ? (
            <NoResults>No results found.</NoResults>
          ) : null}
        </ResultsSection>

        <ResultsSection>
          <ResultsTitle>
            {formatSearchType(rightSearchType)} Results
            {loading.right && <LoadingIndicator />}
          </ResultsTitle>

          {rightResults.length > 0 ? (
            rightResults.map((result, index) => (
              <ResultCard key={`right-${result.id}`}>
                <ResultHeader>
                  <ResultTitle>
                    {index + 1}. {result.name || result.id}
                  </ResultTitle>
                  <ScoreBadge score={result.score}>
                    {formatScore(result.score)}
                  </ScoreBadge>
                </ResultHeader>

                <ResultId>ID: {result.id}</ResultId>

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
          ) : searchPerformed && !loading.right ? (
            <NoResults>No results found.</NoResults>
          ) : null}
        </ResultsSection>
      </ResultsGrid>
    </CompareContainer>
  );
};

export default CompareSearch;
