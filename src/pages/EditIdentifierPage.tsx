import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { PageContainer } from "../components/Forms/ReleaseComponents";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Alert from "../components/common/Alert";
import EditFormManager from "../components/Forms/Edit/EditFormManager";
import ExtraFieldsSection from "../components/Forms/Edit/ExtraFieldsSection";
import EditActionSidebar from "../components/Forms/Edit/EditActionSidebar";
import LLMUploadModal from "../components/Forms/Edit/LLMUploadModal";

import { useEditMetadataApi } from "../components/Forms/api/editMetadataApi";
import { useLLMAssistApi } from "../components/Forms/api/llmAssistAPI";
import {
  parseMetadataToForm,
  extractExtraFields,
  generateUpdatePayload,
} from "../components/Forms/utils/editUtils";
import {
  processLLMResponse,
  getEmptyFields,
  hasUnreviewedFields,
  filterFieldsByVisibility,
} from "../components/Forms/utils/llmUtils";
import {
  ReviewStates,
  ReviewStatus,
} from "../components/Forms/types/reviewTypes";

import datasetConfig from "../components/Forms/config/datasetEditConfig.json";
import softwareConfig from "../components/Forms/config/softwareEditConfig.json";
import computationConfig from "../components/Forms/config/computationEditConfig.json";
import roCrateConfig from "../components/Forms/config/rocrateEditConfig.json";

interface FormData {
  [key: string]: any;
}

const CenteredMessage: React.FC<{ message: string }> = ({ message }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
    }}
  >
    <LoadingSpinner />
    <p style={{ marginTop: 10, color: "#666", textAlign: "center" }}>
      {message}
    </p>
  </div>
);

const EditIdentifierPage: React.FC = () => {
  const params = useParams<{ arkId?: string }>();
  const arkId =
    params?.arkId ??
    (window.location.pathname.includes("/edit/")
      ? window.location.pathname.split("/edit/")[1]
      : "");

  const editApi = useEditMetadataApi();
  const llmApi = useLLMAssistApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [extraFields, setExtraFields] = useState<any>({});
  const [originalFormData, setOriginalFormData] = useState<FormData>({});
  const [originalExtraFields, setOriginalExtraFields] = useState<any>({});
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "updating" | "success" | "error"
  >("idle");

  const [reviewStates, setReviewStates] = useState<ReviewStates>({});
  const [llmPopulatedFields, setLlmPopulatedFields] = useState<Set<string>>(
    new Set()
  );
  const [llmModalOpen, setLlmModalOpen] = useState(false);
  const [fieldVisibility, setFieldVisibility] = useState<
    "minimal" | "ai-ready" | "all"
  >("all");
  const [visibilityLocked, setVisibilityLocked] = useState(false);

  const isRoCrate = config === roCrateConfig;

  useEffect(() => {
    if (!arkId) return;
    fetchMetadata();
  }, [arkId]);

  const fetchMetadata = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await editApi.getMetadata(arkId);
      const metadataContent = data?.metadata ?? data;

      setMetadata(metadataContent);

      const detectedConfig = determineConfig(metadataContent);
      setConfig(detectedConfig);
      console.log("Detected config:", detectedConfig);

      const parsedForm = parseMetadataToForm(metadataContent, detectedConfig);
      const extra = extractExtraFields(metadataContent, detectedConfig);

      setFormData(parsedForm);
      setExtraFields(extra);
      setOriginalFormData(JSON.parse(JSON.stringify(parsedForm)));
      setOriginalExtraFields(JSON.parse(JSON.stringify(extra)));
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const determineConfig = (metadata: any) => {
    const type = metadata["@type"];

    if (!type) return datasetConfig;

    const typeString = Array.isArray(type) ? type.join(" ") : String(type);
    const lowerType = typeString.toLowerCase();

    if (lowerType.includes("software")) return softwareConfig;
    if (lowerType.includes("computation")) return computationConfig;
    if (lowerType.includes("rocrate")) return roCrateConfig;

    return datasetConfig;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (updateStatus === "success") {
      setUpdateStatus("idle");
    }
  };

  const handleExtraFieldsChange = (fields: any) => {
    setExtraFields(fields);
    if (updateStatus === "success") {
      setUpdateStatus("idle");
    }
  };

  const hasChanges = () => {
    return (
      JSON.stringify(formData) !== JSON.stringify(originalFormData) ||
      JSON.stringify(extraFields) !== JSON.stringify(originalExtraFields) ||
      Object.keys(reviewStates).length > 0
    );
  };

  const handleLLMGenerate = async (file: File) => {
    const documents = [{ name: file.name, content: file }];

    const mergedFormData = await llmApi.processDocumentsForEdit(
      documents,
      formData
    );

    const {
      updatedFormData,
      reviewStates: newReviewStates,
      populatedFields,
    } = processLLMResponse(mergedFormData, formData, config);

    setFormData(updatedFormData);
    setReviewStates((prev) => ({ ...prev, ...newReviewStates }));
    setLlmPopulatedFields((prev) => new Set([...prev, ...populatedFields]));

    if (isRoCrate) {
      setFieldVisibility("all");
      setVisibilityLocked(true);
    }
  };

  const handleReviewAction = (
    fieldName: string,
    action: "approve" | "reject"
  ) => {
    setReviewStates((prev) => {
      if (!prev[fieldName]) return prev;

      const newStates = { ...prev };
      newStates[fieldName] = {
        ...prev[fieldName],
        status:
          action === "approve" ? ReviewStatus.Approved : ReviewStatus.Rejected,
        timestamp: Date.now(),
      };

      if (action === "reject") {
        setFormData((prevForm) => ({
          ...prevForm,
          [fieldName]: prev[fieldName].originalValue,
        }));
      }

      return newStates;
    });
  };

  const handleVisibilityChange = (
    newVisibility: "minimal" | "ai-ready" | "all"
  ) => {
    if (!visibilityLocked) {
      setFieldVisibility(newVisibility);
    }
  };

  const handleUpdate = async () => {
    if (hasUnreviewedFields(reviewStates)) {
      const confirmed = window.confirm(
        "You have unreviewed LLM-generated fields. Are you sure you want to save?"
      );
      if (!confirmed) return;
    }

    setUpdateStatus("updating");

    const payload = generateUpdatePayload(
      formData,
      extraFields,
      metadata,
      config
    );

    try {
      await editApi.updateMetadata(arkId, payload);

      setUpdateStatus("success");
      setOriginalFormData(JSON.parse(JSON.stringify(formData)));
      setOriginalExtraFields(JSON.parse(JSON.stringify(extraFields)));
      setReviewStates({});
      setLlmPopulatedFields(new Set());

      setTimeout(() => {
        setUpdateStatus("idle");
      }, 3000);
    } catch (err: any) {
      console.error("Update error:", err);
      setUpdateStatus("error");
      setTimeout(() => {
        setUpdateStatus("idle");
      }, 3000);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        )
      ) {
        setFormData(JSON.parse(JSON.stringify(originalFormData)));
        setExtraFields(JSON.parse(JSON.stringify(originalExtraFields)));
        setReviewStates({});
        setLlmPopulatedFields(new Set());
        setUpdateStatus("idle");
      }
    }
  };

  const getFilteredConfig = () => {
    if (!isRoCrate || fieldVisibility === "all") {
      return config;
    }
    return filterFieldsByVisibility(config, fieldVisibility);
  };

  if (loading) {
    return (
      <PageContainer>
        <CenteredMessage message="Loading metadata..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert type="error" title="Error Loading Metadata" message={error} />
      </PageContainer>
    );
  }

  if (!config || !metadata) {
    return (
      <PageContainer>
        <Alert
          type="info"
          title="No Data"
          message="Unable to load metadata for editing."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageTitle>Edit Metadata</PageTitle>
      {config?.type && <MetadataType>{config.type}</MetadataType>}
      <ArkDisplay>{arkId}</ArkDisplay>

      <MainContent>
        <FormColumn>
          <EditFormManager
            config={getFilteredConfig()}
            formData={formData}
            onFieldChange={handleFieldChange}
            reviewStates={reviewStates}
            onReviewAction={handleReviewAction}
          />
          <ExtraFieldsSection
            extraFields={extraFields}
            onExtraFieldsChange={handleExtraFieldsChange}
          />
        </FormColumn>

        <EditActionSidebar
          visibility={fieldVisibility}
          onVisibilityChange={handleVisibilityChange}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
          onGenerateWithAI={() => setLlmModalOpen(true)}
          arkId={arkId || ""}
          updateStatus={updateStatus}
          hasChanges={hasChanges()}
        />
      </MainContent>

      <LLMUploadModal
        isOpen={llmModalOpen}
        onClose={() => setLlmModalOpen(false)}
        onGenerate={handleLLMGenerate}
        currentFormData={formData}
        config={config}
      />
    </PageContainer>
  );
};

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 10px;
`;

const MetadataType = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 5px;
  font-weight: 600;
`;

const ArkDisplay = styled.div`
  text-align: center;
  font-family: monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 30px;
`;

const MainContent = styled.div`
  display: flex;
  gap: 30px;
  align-items: flex-start;
`;

const FormColumn = styled.div`
  flex: 1;
  min-width: 0;
`;

export default EditIdentifierPage;
