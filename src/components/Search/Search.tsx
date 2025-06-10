import React, { useState } from "react";
import styled from "styled-components";

const API_URL = window.API_URL;

const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center; // Align items vertically
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.md}; // Add gap between elements
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
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
  display: flex; // For spinner alignment
  align-items: center; // For spinner alignment
  justify-content: center; // For spinner alignment
  min-width: 100px; // Ensure button has some width for spinner

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ComingSoonButton = styled(SearchButton)`
  background-color: ${({ theme }) => theme.colors.textSecondary};
  cursor: not-allowed;
  opacity: 0.5;

  &:hover {
    background-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SearchMetadataDisplay = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: 0.9rem;
`;

const ErrorMetadata = styled(SearchMetadataDisplay)`
  background-color: #ffebee; // A light red for errors
  color: ${({ theme }) =>
    theme.colors.error || "#D32F2F"}; // Default error color
  border-left: 4px solid ${({ theme }) => theme.colors.error || "#D32F2F"};
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
  word-break: break-word; // Prevent long names from overflowing
`;

const ResultId = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  word-break: break-all; // Allow long IDs to wrap
`;

const ResultDescription = styled.p`
  margin: ${({ theme }) => theme.spacing.md} 0;
  line-height: 1.5;
`;

const ScoreBadge = styled.span<{ score: number }>`
  background-color: ${({ theme, score }) =>
    score > 0.7
      ? theme.colors.success || "#4CAF50" // Default success color
      : score > 0.5
      ? theme.colors.primary
      : theme.colors.textSecondary};
  color: white;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap; // Prevent score from wrapping
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
  width: 20px; // Adjusted size
  height: 20px; // Adjusted size
  border: 2px solid rgba(255, 255, 255, 0.3);
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

interface SearchResultItem {
  id: string; // Corresponds to @id from backend
  type?: string; // Corresponds to @type from backend
  name?: string;
  description?: string;
  score: number;
  keywords?: string[];
}

// Adjusted to match the SearchResults model from search_models.py
interface SearchResponseData {
  query: string;
  total_results: number;
  results: SearchResultItem[];
  time_taken_ms: number;
}

interface SearchDisplayInfo {
  query?: string;
  totalResults?: number;
  timeTakenMs?: number;
  error?: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchDisplayInfo, setSearchDisplayInfo] =
    useState<SearchDisplayInfo | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchPerformed(true);
    setSearchDisplayInfo(null); // Clear previous metadata/error

    try {
      const response = await fetch(
        `${API_URL}/search/basic?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown server error" }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data: SearchResponseData = await response.json();

      setResults(data.results || []);
      setSearchDisplayInfo({
        query: data.query,
        totalResults: data.total_results,
        timeTakenMs: data.time_taken_ms,
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setSearchDisplayInfo({
        query: query, // Show the attempted query even on error
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

  const formatScore = (score: number) => {
    // Assuming score from backend is already 0-1 range as per search_crud.py
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
          disabled={loading}
        />
        <SearchButton
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          isLoading={loading}
        >
          {loading ? <LoadingSpinner /> : "Basic Search"}
        </SearchButton>
        <ComingSoonButton disabled>Semantic Search (Soon)</ComingSoonButton>
      </SearchBox>

      {searchPerformed && (
        <>
          {searchDisplayInfo && !searchDisplayInfo.error ? (
            <SearchMetadataDisplay>
              <strong>Search:</strong> {searchDisplayInfo.query} |
              <strong> Method:</strong> Basic Text Search |
              <strong> Results:</strong> {searchDisplayInfo.totalResults} |
              <strong> Time:</strong>{" "}
              {searchDisplayInfo.timeTakenMs?.toFixed(0)}ms
            </SearchMetadataDisplay>
          ) : searchDisplayInfo?.error ? (
            <ErrorMetadata>
              Search for "{searchDisplayInfo.query}" failed:{" "}
              {searchDisplayInfo.error}
            </ErrorMetadata>
          ) : null}
        </>
      )}

      {results.length > 0 ? (
        <>
          <ResultsTitle>Search Results</ResultsTitle>
          {results.map((result, index) => (
            <ResultCard key={`${result.id}-${index}`}>
              {" "}
              {/* Ensure unique key if IDs can repeat */}
              <ResultHeader>
                <ResultTitle>
                  {index + 1}. {result.name || "N/A"}
                </ResultTitle>
                <ScoreBadge score={result.score}>
                  {formatScore(result.score)}
                </ScoreBadge>
              </ResultHeader>
              <ResultId>ID: {result.id}</ResultId>
              {result.type && (
                <ResultId>
                  Type:{" "}
                  {Array.isArray(result.type)
                    ? result.type.join(", ")
                    : result.type}
                </ResultId>
              )}
              {result.description && (
                <ResultDescription>{result.description}</ResultDescription>
              )}
              {result.keywords && result.keywords.length > 0 && (
                <KeywordsContainer>
                  {result.keywords.map((keyword, i) => (
                    <Keyword key={`${result.id}-keyword-${i}`}>
                      {keyword}
                    </Keyword>
                  ))}
                </KeywordsContainer>
              )}
            </ResultCard>
          ))}
        </>
      ) : searchPerformed && !loading ? (
        <NoResults>No results found for "{query}".</NoResults>
      ) : null}
    </SearchContainer>
  );
};

export default Search;
