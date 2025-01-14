import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import Header from "../components/header_footer/Header";
import Footer from "../components/header_footer/Footer";
import Alert from "../components/Publish/Alert";
import LoadingSpinner from "../components/Publish/LoadingSpinner";
import PublicationForm from "../components/Publish/PublicationForm";
import PublishProgress from "../components/Publish/PublishProgress";
import {
  StyledForm,
  FormTitle,
  LinkContainer,
  DatasetLink,
  LinkButton,
} from "../components/Publish/PublishStyles";

export const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const PUBLISH_STEPS = [
  {
    id: "metadata",
    label: "Creating Repository Dataset",
    description: "Publishing metadata to repository",
  },
  {
    id: "upload",
    label: "Uploading Data",
    description: "Uploading files to repository",
  },
  {
    id: "complete",
    label: "Publication Complete",
    description: "Metadata and data published on repository",
  },
];

const PublishPage = () => {
  const location = useLocation();
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [persistentId, setPersistentId] = useState(null);
  const [datasetUrl, setDatasetUrl] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    author: "",
    description: "",
    keywords: "",
    datePublished: new Date().toISOString().split("T")[0],
    license: "CC BY 4.0",
  });

  const arkId = location.pathname.replace("/publish/", "");

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!arkId) {
        setError("Invalid ARK identifier");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/${arkId}`, {
          headers: getAuthHeaders(),
        });

        if (!response.data) {
          throw new Error("No metadata found for this ROCrate");
        }

        setMetadata(response.data);
        setFormData({
          name: response.data.name || "",
          author: Array.isArray(response.data.author)
            ? response.data.author.join(", ")
            : response.data.author || "",
          description: response.data.description || "",
          keywords: Array.isArray(response.data.keywords)
            ? response.data.keywords.join(", ")
            : response.data.keywords || "",
          datePublished:
            response.data.datePublished ||
            new Date().toISOString().split("T")[0],
          license: "CC BY 4.0",
        });
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Failed to fetch ROCrate metadata";
        setError(errorMessage);
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [arkId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e, formMetadata) => {
    e.preventDefault();
    setPublishing(true);
    setError(null);
    setSuccessMessage(null);
    setCurrentStep(0);
    setPersistentId(null);
    setDatasetUrl(null);
    setShowForm(false);

    try {
      const headers = getAuthHeaders();

      // Step 1: Create metadata
      const createResponse = await axios.post(
        `${API_URL}/publish/create/${arkId}?platform_url=${encodeURIComponent(
          formMetadata.platform_url
        )}&database=${encodeURIComponent(formMetadata.database)}`,
        { userProvidedMetadata: formMetadata.userProvidedMetadata },
        { headers }
      );

      const pid = createResponse.data.persistent_id;
      setPersistentId(pid);
      setDatasetUrl(createResponse.data.dataset_url);
      setCurrentStep(1);

      // Step 2: Upload data
      await axios.post(
        `${API_URL}/publish/upload/${arkId}?platform_url=${encodeURIComponent(
          formMetadata.platform_url
        )}`,
        {},
        { headers }
      );
      setCurrentStep(2);

      setSuccessMessage(`Successfully published to repository with ID: ${pid}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to publish to repository";
      setError(errorMessage);
      console.error("Error publishing:", err);
      setCurrentStep(1);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <div className="container mx-auto px-4 max-w-3xl py-8">
            <StyledForm>
              <FormTitle>Error Fetching Metadata</FormTitle>
              <Alert type="error">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-medium">Error</h3>
                  <p>{error}</p>
                </div>
              </Alert>
            </StyledForm>
          </div>
        </main>
      </div>
    );
  }

  const showProgress = publishing || currentStep >= 0 || error;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-3xl py-8">
          <StyledForm onSubmit={handleSubmit}>
            <FormTitle>Publish ROCrate to Repository</FormTitle>

            {error && (
              <Alert type="error">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-medium">Error</h3>
                  <p>{error}</p>
                </div>
              </Alert>
            )}

            {successMessage && (
              <Alert type="success">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <h3 className="font-medium">Success</h3>
                  <p>{successMessage}</p>
                </div>
              </Alert>
            )}

            {showProgress && (
              <div className="mb-6 bg-[#2a3552] p-6 rounded-lg">
                <h3 className="text-white font-medium mb-4">
                  Publication Progress
                </h3>
                <PublishProgress
                  steps={PUBLISH_STEPS}
                  currentStep={currentStep}
                  error={Boolean(error)}
                  errorMessage={error}
                />
                {persistentId && (
                  <div className="mt-4 text-sm text-gray-300">
                    Persistent ID:{" "}
                    <span className="font-mono">{persistentId}</span>
                  </div>
                )}
              </div>
            )}

            {datasetUrl && currentStep === 2 && !error && (
              <DatasetLink url={datasetUrl} />
            )}

            {showForm && !publishing && !error && (
              <PublicationForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                publishing={publishing}
              />
            )}
          </StyledForm>
        </div>
      </main>
    </div>
  );
};

export default PublishPage;
