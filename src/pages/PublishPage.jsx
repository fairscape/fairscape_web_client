import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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

const PUBLISH_STEPS = [
  {
    id: "metadata",
    label: "Creating Dataverse Dataset",
    description: "Publishing metadata to Dataverse",
  },
  {
    id: "upload",
    label: "Uploading Data",
    description: "Uploading files to Dataverse",
  },
  {
    id: "complete",
    label: "Publication Complete",
    description: "Metadata and data published on Dataverse",
  },
];

// Simulated API calls with promises and timeouts
const simulateCreateMetadata = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        persistent_id: "doi:10.5072/FK2/123456",
        dataset_url:
          "https://dataverse.example.org/dataset.html?persistentId=doi:10.5072/FK2/123456",
      });
    }, 2000);
  });
};

const simulateUploadData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: "success" });
    }, 3000);
  });
};

const PublishPage = () => {
  const location = useLocation();
  const [metadata, setMetadata] = useState({ name: "Test ROCrate" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [persistentId, setPersistentId] = useState(null);
  const [datasetUrl, setDatasetUrl] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    name: "Test Dataset",
    author: "John Doe",
    description: "Test description",
    keywords: "test, demo",
    datePublished: new Date().toISOString().split("T")[0],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    setError(null);
    setSuccessMessage(null);
    setCurrentStep(0);
    setPersistentId(null);
    setDatasetUrl(null);
    setShowForm(false);

    try {
      // Step 1: Create metadata
      const createResponse = await simulateCreateMetadata();
      setPersistentId(createResponse.persistent_id);
      setDatasetUrl(createResponse.dataset_url);
      setCurrentStep(1);

      // Step 2: Upload data
      await simulateUploadData();
      setCurrentStep(2);

      setSuccessMessage(
        `Successfully published to Dataverse with ID: ${createResponse.persistent_id}`
      );
    } catch (err) {
      setError("Failed to publish to Dataverse");
      console.error("Error publishing:", err);
      setCurrentStep(-1);
      setShowForm(true);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const showProgress = publishing || (currentStep === 2 && !error);

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8">
      <Header />
      <div className="container mx-auto px-4 max-w-3xl">
        <StyledForm onSubmit={handleSubmit}>
          <FormTitle>Publish ROCrate to Dataverse</FormTitle>

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

          {showForm && !publishing && (
            <PublicationForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              publishing={publishing}
            />
          )}
        </StyledForm>
      </div>
      <Footer />
    </div>
  );
};

export default PublishPage;
