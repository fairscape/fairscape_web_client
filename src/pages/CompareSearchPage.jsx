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
  Grid,
  Paper,
} from "@mui/material";

const SEARCH_API_URL =
  import.meta.env.VITE_SEARCH_API_URL || "http://localhost:5050/api";

const CompareSearchPage = () => {
  const [query, setQuery] = useState("");
  const [leftSearchType, setLeftSearchType] = useState("semantic");
  const [rightSearchType, setRightSearchType] = useState("tfidf");
  const [leftResults, setLeftResults] = useState([]);
  const [rightResults, setRightResults] = useState([]);
  const [loading, setLoading] = useState({ left: false, right: false });
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [leftMetadata, setLeftMetadata] = useState(null);
  const [rightMetadata, setRightMetadata] = useState(null);

  const handleSearch = async (side) => {
    if (!query.trim()) return;

    setLoading((prev) => ({ ...prev, [side]: true }));
    setSearchPerformed(true);

    const searchType = side === "left" ? leftSearchType : rightSearchType;

    try {
      const response = await axios.get(
        `${SEARCH_API_URL}/search?query=${encodeURIComponent(
          query
        )}&type=${searchType}`
      );

      if (side === "left") {
        setLeftResults(response.data.results || []);
        setLeftMetadata({
          query: response.data.query,
          totalResults: response.data.total_results,
          timeTaken: response.data.time_taken,
          searchType: response.data.search_type,
        });
      } else {
        setRightResults(response.data.results || []);
        setRightMetadata({
          query: response.data.query,
          totalResults: response.data.total_results,
          timeTaken: response.data.time_taken,
          searchType: response.data.search_type,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      if (side === "left") {
        setLeftResults([]);
        setLeftMetadata({
          error: error.response?.data?.error || error.message,
        });
      } else {
        setRightResults([]);
        setRightMetadata({
          error: error.response?.data?.error || error.message,
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCompare();
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
    <Container maxWidth="xl">
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
            onClick={handleCompare}
            disabled={loading.left || loading.right || !query.trim()}
          >
            {loading.left || loading.right ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Compare"
            )}
          </Button>
        </Box>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Left Search Method</FormLabel>
              <RadioGroup
                row
                name="left-search-type"
                value={leftSearchType}
                onChange={(e) => setLeftSearchType(e.target.value)}
              >
                <FormControlLabel
                  value="semantic"
                  control={<Radio />}
                  label="Semantic"
                />
                <FormControlLabel
                  value="tfidf"
                  control={<Radio />}
                  label="TF-IDF"
                />
                <FormControlLabel
                  value="basic"
                  control={<Radio />}
                  label="Basic"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Right Search Method</FormLabel>
              <RadioGroup
                row
                name="right-search-type"
                value={rightSearchType}
                onChange={(e) => setRightSearchType(e.target.value)}
              >
                <FormControlLabel
                  value="semantic"
                  control={<Radio />}
                  label="Semantic"
                />
                <FormControlLabel
                  value="tfidf"
                  control={<Radio />}
                  label="TF-IDF"
                />
                <FormControlLabel
                  value="basic"
                  control={<Radio />}
                  label="Basic"
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>

        {searchPerformed && (
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {leftMetadata && !leftMetadata.error ? (
                  <Box>
                    <Typography variant="subtitle1">
                      <strong>
                        {formatSearchType(leftMetadata.searchType)}
                      </strong>
                    </Typography>
                    <Typography variant="body2">
                      Results: {leftMetadata.totalResults} | Time:{" "}
                      {leftMetadata.timeTaken.toFixed(3)}s
                    </Typography>
                  </Box>
                ) : leftMetadata?.error ? (
                  <Typography color="error">
                    Error: {leftMetadata.error}
                  </Typography>
                ) : null}
              </Grid>
              <Grid item xs={12} md={6}>
                {rightMetadata && !rightMetadata.error ? (
                  <Box>
                    <Typography variant="subtitle1">
                      <strong>
                        {formatSearchType(rightMetadata.searchType)}
                      </strong>
                    </Typography>
                    <Typography variant="body2">
                      Results: {rightMetadata.totalResults} | Time:{" "}
                      {rightMetadata.timeTaken.toFixed(3)}s
                    </Typography>
                  </Box>
                ) : rightMetadata?.error ? (
                  <Typography color="error">
                    Error: {rightMetadata.error}
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
          </Paper>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {formatSearchType(leftSearchType)} Results
                {loading.left && <CircularProgress size={20} sx={{ ml: 2 }} />}
              </Typography>
              {leftResults.length > 0 ? (
                leftResults.map((result, index) => (
                  <Card key={`left-${result.id}`} sx={{ mb: 2 }}>
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
                ))
              ) : searchPerformed && !loading.left ? (
                <Typography variant="body1">No results found.</Typography>
              ) : null}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {formatSearchType(rightSearchType)} Results
                {loading.right && <CircularProgress size={20} sx={{ ml: 2 }} />}
              </Typography>
              {rightResults.length > 0 ? (
                rightResults.map((result, index) => (
                  <Card key={`right-${result.id}`} sx={{ mb: 2 }}>
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
                ))
              ) : searchPerformed && !loading.right ? (
                <Typography variant="body1">No results found.</Typography>
              ) : null}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default CompareSearchPage;
