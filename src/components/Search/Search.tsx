import React, { useState } from "react";
import styled from "styled-components";

// Use a different API URL than your main app
const SEARCH_API_URL =
  import.meta.env.VITE_SEARCH_API_URL || "http://localhost:5050/api";

const SearchContainer = styled.div`
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

const SearchMethodsContainer = styled.fieldset`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SearchMethodsLegend = styled.legend`
  padding: 0 ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const RadioGroupContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
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

const SearchMetadata = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: 0.9rem;
`;

const ErrorMetadata = styled(SearchMetadata)`
  background-color: #ffebee;
  color: ${({ theme }) => theme.colors.error};
  border-left: 4px solid ${({ theme }) => theme.colors.error};
`;

const ResultsTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 1.5rem;
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
  font-size: 1.25rem;
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

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const NoResults = styled.p`
  margin-top: ${({ theme }) => theme.spacing.xl};
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

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("semantic");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchMetadata, setSearchMetadata] =
    useState<SearchMetadataInfo | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchPerformed(true);

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

      setResults(data.results || []);
      setSearchMetadata({
        query: data.query,
        totalResults: data.total_results,
        timeTaken: data.time_taken,
        searchType: data.search_type,
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setSearchMetadata({
        error: (error as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
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
    <SearchContainer>
      <SearchBox>
        <SearchInput
          placeholder="Enter your search query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          isLoading={loading}
        >
          {loading ? <LoadingSpinner /> : "Search"}
        </SearchButton>
      </SearchBox>

      <SearchMethodsContainer>
        <SearchMethodsLegend>Search Method</SearchMethodsLegend>
        <RadioGroupContainer>
          <RadioLabel>
            <RadioInput
              type="radio"
              name="search-type"
              value="semantic"
              checked={searchType === "semantic"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            Semantic Search
          </RadioLabel>
          <RadioLabel>
            <RadioInput
              type="radio"
              name="search-type"
              value="tfidf"
              checked={searchType === "tfidf"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            TF-IDF Search
          </RadioLabel>
          <RadioLabel>
            <RadioInput
              type="radio"
              name="search-type"
              value="basic"
              checked={searchType === "basic"}
              onChange={(e) => setSearchType(e.target.value)}
            />
            Basic Text Search
          </RadioLabel>
        </RadioGroupContainer>
      </SearchMethodsContainer>

      {searchPerformed && (
        <>
          {searchMetadata && !searchMetadata.error ? (
            <SearchMetadata>
              <strong>Search:</strong> {searchMetadata.query} |
              <strong> Method:</strong>{" "}
              {formatSearchType(searchMetadata.searchType)} |
              <strong> Results:</strong> {searchMetadata.totalResults} |
              <strong> Time:</strong> {searchMetadata.timeTaken?.toFixed(3)}s
            </SearchMetadata>
          ) : searchMetadata?.error ? (
            <ErrorMetadata>Error: {searchMetadata.error}</ErrorMetadata>
          ) : null}
        </>
      )}

      {results.length > 0 ? (
        <>
          <ResultsTitle>Search Results</ResultsTitle>

          {results.map((result, index) => (
            <ResultCard key={result.id}>
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
          ))}
        </>
      ) : searchPerformed && !loading ? (
        <NoResults>No results found.</NoResults>
      ) : null}
    </SearchContainer>
  );
};

export default Search;
