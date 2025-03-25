import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";

// Use a different API URL than your main app
const SEARCH_API_URL =
  import.meta.env.VITE_SEARCH_API_URL || "http://localhost:5050/api";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("semantic");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchPerformed(true);

    try {
      const response = await axios.get(
        `${SEARCH_API_URL}/search?query=${encodeURIComponent(
          query
        )}&type=${searchType}`
      );

      setResults(response.data.results || []);
      setSearchMetadata({
        query: response.data.query,
        totalResults: response.data.total_results,
        timeTaken: response.data.time_taken,
        searchType: response.data.search_type,
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
      setSearchMetadata({
        error: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatSearchType = (type) => {
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

  const formatScore = (score) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" mb={3}>
          <TextField
            fullWidth
            variant="outlined"
            label="Search Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mr: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Search"
            )}
          </Button>
        </Box>

        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend">Search Method</FormLabel>
          <RadioGroup
            row
            name="search-type"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <FormControlLabel
              value="semantic"
              control={<Radio />}
              label="Semantic Search"
            />
            <FormControlLabel
              value="tfidf"
              control={<Radio />}
              label="TF-IDF Search"
            />
            <FormControlLabel
              value="basic"
              control={<Radio />}
              label="Basic Text Search"
            />
          </RadioGroup>
        </FormControl>

        {searchPerformed && (
          <Box mb={3}>
            {searchMetadata && !searchMetadata.error ? (
              <Box sx={{ bgcolor: "background.paper", p: 2, borderRadius: 1 }}>
                <Typography variant="body2">
                  Search: <strong>{searchMetadata.query}</strong> | Method:{" "}
                  <strong>{formatSearchType(searchMetadata.searchType)}</strong>{" "}
                  | Results: <strong>{searchMetadata.totalResults}</strong> |
                  Time: <strong>{searchMetadata.timeTaken.toFixed(3)}s</strong>
                </Typography>
              </Box>
            ) : searchMetadata?.error ? (
              <Box sx={{ bgcolor: "#ffebee", p: 2, borderRadius: 1 }}>
                <Typography color="error">
                  Error: {searchMetadata.error}
                </Typography>
              </Box>
            ) : null}
          </Box>
        )}

        {results.length > 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>

            {results.map((result, index) => (
              <Card key={result.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography variant="h6" component="h2">
                      {index + 1}. {result.name || result.id}
                    </Typography>
                    <Chip
                      label={formatScore(result.score)}
                      color={
                        result.score > 0.7
                          ? "success"
                          : result.score > 0.5
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    ID: {result.id}
                  </Typography>

                  {result.description && (
                    <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                      {result.description}
                    </Typography>
                  )}

                  {result.keywords && result.keywords.length > 0 && (
                    <Box mt={2}>
                      {result.keywords.map((keyword, i) => (
                        <Chip
                          key={i}
                          label={keyword}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : searchPerformed && !loading ? (
          <Typography variant="body1">No results found.</Typography>
        ) : null}
      </Box>
    </Container>
  );
};

export default SearchPage;
