import React, { useState, useEffect } from "react";
import FormField from "./FormField";
import {
  StyledForm,
  FormTitle,
  Button,
  Label,
  Input,
  FormGroup,
} from "./PublishStyles";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const LICENSE_OPTIONS = [
  "CC BY 4.0",
  "CC BY-SA 4.0",
  "CC BY-NC 4.0",
  "CC BY-NC-SA 4.0",
  "CC BY-ND 4.0",
  "CC BY-NC-ND 4.0",
  "CC0 1.0",
];

const PublicationForm = ({ formData, onInputChange, onSubmit, publishing }) => {
  const [tokens, setTokens] = useState([]);
  const [selectedDataverse, setSelectedDataverse] = useState("");
  const [database, setDatabase] = useState("libradata");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/profile/credentials`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setTokens(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedDataverse(response.data[0].endpointURL);
        }
      } catch (err) {
        setError("Failed to fetch Dataverse tokens");
        console.error("Error fetching tokens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, {
      dataverse_url: selectedDataverse,
      database: database,
      userProvidedMetadata: formData,
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <FormGroup>
        <Label htmlFor="dataverse">Select Dataverse Instance *</Label>
        <Input
          as="select"
          id="dataverse"
          value={selectedDataverse}
          onChange={(e) => setSelectedDataverse(e.target.value)}
          disabled={loading || tokens.length === 0}
          required
        >
          {loading ? (
            <option>Loading...</option>
          ) : tokens.length === 0 ? (
            <option>No Dataverse tokens available</option>
          ) : (
            tokens.map((token) => (
              <option key={token.tokenUID} value={token.endpointURL}>
                {token.endpointURL}
              </option>
            ))
          )}
        </Input>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="database">Database Name *</Label>
        <Input
          type="text"
          id="database"
          value={database}
          onChange={(e) => setDatabase(e.target.value)}
          placeholder="Enter database name"
          required
        />
      </FormGroup>

      <FormField
        label="Title"
        name="name"
        value={formData.name}
        onChange={onInputChange}
        placeholder="Enter title"
      />

      <FormField
        label="Authors"
        name="author"
        value={formData.author}
        onChange={onInputChange}
        placeholder="1st Author First Last, 2nd Author First Last, ..."
      />

      <FormField
        label="Description"
        type="textarea"
        name="description"
        value={formData.description}
        onChange={onInputChange}
        placeholder="Enter description"
      />

      <FormField
        label="License"
        name="license"
        type="select"
        value={formData.license || "CC BY 4.0"}
        onChange={onInputChange}
        options={LICENSE_OPTIONS}
      />

      <FormField
        label="Keywords"
        name="keywords"
        value={formData.keywords}
        onChange={onInputChange}
        placeholder="genetics, vital signs, heart rate"
      />

      <FormField
        label="Publication Date"
        type="date"
        name="datePublished"
        value={formData.datePublished}
        onChange={onInputChange}
      />

      <div className="flex gap-4 mt-8">
        <Button
          type="submit"
          disabled={publishing || loading || tokens.length === 0}
          onClick={handleSubmit}
        >
          {publishing ? "Publishing..." : "Publish to Dataverse"}
        </Button>
      </div>
    </div>
  );
};

export default PublicationForm;
