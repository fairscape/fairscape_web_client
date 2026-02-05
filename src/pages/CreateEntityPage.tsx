import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import EditFormManager from "../components/Forms/Edit/EditFormManager";
import ExtraFieldsSection from "../components/Forms/Edit/ExtraFieldsSection";
import CreateActionSidebar from "../components/Forms/Create/CreateActionSidebar";
import FileUploadSection from "../components/Forms/Create/FileUploadSection";
import {
  fetchParentMetadata,
  initializeCreateForm,
  generateCreatePayload,
  validateRequiredFields,
  extractFileMetadata,
  generateArkId,
} from "../components/Forms/utils/createUtils";
import { useMetadataApi } from "../components/MetadataDisplay/api/metadataApi";
import { useHttp } from "../components/Forms/api/httpClient";

import datasetEditConfig from "../components/Forms/config/datasetEditConfig.json";
import softwareEditConfig from "../components/Forms/config/softwareEditConfig.json";
import computationEditConfig from "../components/Forms/config/computationEditConfig.json";
import schemaEditConfig from "../components/Forms/config/schemaEditConfig.json";

const CreateEntityPage: React.FC = () => {
  const { entityType } = useParams<{ entityType: string }>();
  const [searchParams] = useSearchParams();
  const parentArkId = searchParams.get("parent");
  const metadataApi = useMetadataApi();
  const http = useHttp();

  const [config, setConfig] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [extraFields, setExtraFields] = useState<any>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parentMetadata, setParentMetadata] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);

      const selectedConfig = getConfig(entityType || "");
      setConfig(selectedConfig);

      let parent = null;
      if (parentArkId) {
        parent = await fetchParentMetadata(parentArkId, metadataApi);
        setParentMetadata(parent);
      }

      const initialFormData = initializeCreateForm(
        selectedConfig,
        parent,
        parentArkId,
        entityType || ""
      );
      setFormData(initialFormData);

      setIsLoading(false);
    };

    initializePage();
  }, [entityType, parentArkId]);

  const getConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case "dataset":
        return datasetEditConfig;
      case "software":
        return softwareEditConfig;
      case "computation":
        return computationEditConfig;
      case "schema":
        return schemaEditConfig;
      default:
        return datasetEditConfig;
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    const updatedFormData = {
      ...formData,
      [fieldName]: value,
    };

    // Regenerate ARK ID when name changes
    if (fieldName === "name" && entityType) {
      updatedFormData["@id"] = generateArkId(entityType, value);
    }

    setFormData(updatedFormData);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);

    const fileMetadata = extractFileMetadata(file);

    setFormData((prev: any) => {
      const updatedName = prev.name || fileMetadata.name;
      const shouldUpdateId = !prev.name && fileMetadata.name;

      return {
        ...prev,
        name: updatedName,
        format: prev.format || fileMetadata.dataFormat,
        dataFormat: prev.dataFormat || fileMetadata.dataFormat,
        fileFormat: prev.fileFormat || fileMetadata.fileFormat,
        description: prev.description || fileMetadata.description,
        contentSize: prev.contentSize || fileMetadata.contentSize,
        filename: prev.filename || fileMetadata.filename,
        "@id": shouldUpdateId && entityType ? generateArkId(entityType, updatedName) : prev["@id"],
      };
    });
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSave = async () => {
    const missingFields = validateRequiredFields(formData, config);
    if (missingFields.length > 0) {
      alert(
        `Missing required fields:\n\n${missingFields.map((f) => `• ${f}`).join("\n")}`
      );
      return;
    }

    setSaveStatus("saving");
    setErrorMessage(null);

    const payload = generateCreatePayload(entityType!, formData, extraFields);

    if (entityType?.toLowerCase() === "dataset") {
      try {
        const formPayload = new FormData();
        formPayload.append("datasetMetadata", JSON.stringify(payload));
        if (uploadedFile) {
          formPayload.append("uploadFile", uploadedFile);
        }

        const response = await http("/dataset", {
          method: "POST",
          body: formPayload,
        });

        console.log("Dataset created:", response);
        setSaveStatus("success");

        setTimeout(() => {
          if (parentArkId) {
            window.location.href = `/view/${parentArkId}`;
          }
        }, 1500);
      } catch (err: any) {
        console.error("Failed to create dataset:", err);
        setSaveStatus("error");
        setErrorMessage(err.message || "Failed to create dataset");
      }
    }
  };

  const handleDownload = () => {
    // Validate first
    const missingFields = validateRequiredFields(formData, config);
    if (missingFields.length > 0) {
      alert(
        `Cannot download: Missing required fields:\n\n${missingFields.map((f) => `• ${f}`).join("\n")}`
      );
      return;
    }

    // Generate payload
    const payload = generateCreatePayload(entityType!, formData, extraFields);

    // Create download
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: "application/ld+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Clean filename
    const cleanName = formData.name?.replace(/[^a-z0-9]/gi, "-") || "entity";
    a.download = `${entityType}-${cleanName}-${Date.now()}.jsonld`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel? Unsaved changes will be lost."
      )
    ) {
      if (parentArkId) {
        window.location.href = `/view/${parentArkId}`;
      } else {
        window.history.back();
      }
    }
  };

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Loading...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!entityType || !config) {
    return (
      <ErrorContainer>
        <ErrorText>Invalid entity type</ErrorText>
      </ErrorContainer>
    );
  }

  const hasValidForm = validateRequiredFields(formData, config).length === 0;

  return (
    <PageContainer>
      <Header>
        <TitleSection>
          <PageTitle>Create {capitalize(entityType)}</PageTitle>
          {parentArkId && <ParentInfo>Parent: {parentArkId}</ParentInfo>}
        </TitleSection>
      </Header>

      <ContentArea>
        <MainContent>
          <FileUploadSection
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            onRemoveFile={handleRemoveFile}
          />

          <EditFormManager
            config={config}
            formData={formData}
            onFieldChange={handleFieldChange}
            parentRoCrateId={parentArkId || undefined}
          />

          <ExtraFieldsSection
            extraFields={extraFields}
            onExtraFieldsChange={setExtraFields}
          />
        </MainContent>

        <SidebarArea>
          <CreateActionSidebar
            onSave={handleSave}
            onDownload={handleDownload}
            onCancel={handleCancel}
            saveStatus={saveStatus}
            hasValidForm={hasValidForm}
            entityType={entityType}
            parentArkId={parentArkId}
            errorMessage={errorMessage}
          />
        </SidebarArea>
      </ContentArea>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 20px;
`;

const Header = styled.div`
  max-width: 1400px;
  margin: 0 auto 20px auto;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const ParentInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
`;

const ContentArea = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 30px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SidebarArea = styled.div`
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
`;

const LoadingText = styled.div`
  font-size: 1.125rem;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
`;

const ErrorText = styled.div`
  font-size: 1.125rem;
  color: #ef4444;
`;

export default CreateEntityPage;
