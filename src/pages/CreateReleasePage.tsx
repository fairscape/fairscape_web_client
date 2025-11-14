import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import releaseFormConfig from "../components/Forms/config/rocrateEditConfig.json";
import { PageContainer } from "../components/Forms/ReleaseComponents";
import {
  parseRoCrateMetadata,
  generateReleaseJson,
} from "../components/Forms/utils/releaseUtils";
import {
  saveCrate,
  checkCrateExists,
} from "../components/Forms/utils/storageUtils";
import { useLLMAssistApi } from "../components/Forms/api/llmAssistApi";
import { filterFieldsByVisibility } from "../components/Forms/utils/llmUtils";
import UnifiedStartingPage from "../components/Forms/Release/UnifiedStartingPage";
import FormManager from "../components/Forms/Release/FormManager";
import DocumentUploader from "../components/Forms/Release/DocumentUploader";
import ActionSidebar from "../components/Forms/Release/ActionSideBar";
import { PageTitle } from "../components/shared/SharedStyles";

interface FormData {
  [key: string]: any;
}

interface UploadedFile {
  name: string;
  content: string;
}

interface ReviewState {
  [sectionId: string]: {
    reviewed: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
  };
}

const CreateRelease: React.FC = () => {
  const llmApi = useLLMAssistApi();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"landing" | "form">("landing");
  const [currentMethod, setCurrentMethod] = useState<
    "manual" | "upload-existing" | "direct" | "interactive" | null
  >(null);
  const [formData, setFormData] = useState<FormData>({});
  const [reviewState, setReviewState] = useState<ReviewState>({});
  const [isReviewRequired, setIsReviewRequired] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [uploadedCrate, setUploadedCrate] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<UploadedFile[]>([]);
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [fieldVisibility, setFieldVisibility] = useState<
    "minimal" | "ai-ready" | "all"
  >("all");
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);

  useEffect(() => {
    const state = location.state as any;
    if (state && state.fromD4D && state.rocrate) {
      try {
        const content =
          typeof state.rocrate === "string"
            ? state.rocrate
            : JSON.stringify(state.rocrate);
        const parsedData = parseRoCrateMetadata(content);
        setFormData(parsedData);

        const initialReviewState: ReviewState = {};
        releaseFormConfig.sections.forEach((section: any) => {
          initialReviewState[section.id] = { reviewed: false };
        });
        initialReviewState["subCrates"] = { reviewed: true };
        setReviewState(initialReviewState);

        setIsReviewRequired(true);
        setIsReviewMode(true);
        setShowDocumentUploader(false);
        setMode("form");
      } catch (error) {
        console.error("Error initializing form from RO-Crate:", error);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (mode === "form" && isReviewRequired && !isReviewMode) {
      const initialReviewState: ReviewState = {};
      releaseFormConfig.sections.forEach((section) => {
        if (!reviewState[section.id]) {
          initialReviewState[section.id] = { reviewed: false };
        }
      });
      if (!reviewState["subCrates"]) {
        initialReviewState["subCrates"] = { reviewed: true };
      }
      if (Object.keys(initialReviewState).length > 0) {
        setReviewState((prev) => ({ ...prev, ...initialReviewState }));
      }
    }
  }, [mode, isReviewRequired, isReviewMode, reviewState]);

  const handleCreateMethod = (
    method: "manual" | "upload-existing" | "direct" | "interactive"
  ) => {
    setCurrentMethod(method);

    if (method === "interactive") {
      navigate("/d4d-assistant", {
        state: { fromCreateRelease: true },
      });
    } else if (method === "manual") {
      const defaults: FormData = {};
      releaseFormConfig.sections.forEach((section) => {
        section.fields.forEach((field: any) => {
          if (field.defaultValue === "today") {
            defaults[field.name] = new Date().toISOString().split("T")[0];
          } else if (field.defaultValue) {
            defaults[field.name] = field.defaultValue;
          } else {
            defaults[field.name] = "";
          }
        });
      });
      defaults.hasPart = [];
      defaults.subCrates = [];
      setFormData(defaults);
      setIsReviewRequired(false);
      setShowDocumentUploader(false);
      setMode("form");
    } else if (method === "direct") {
      setShowDocumentUploader(true);
      setMode("form");
    }
  };

  const handleUploadExisting = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = parseRoCrateMetadata(content);
        setFormData(parsedData);
        setUploadedCrate(file);
        setIsReviewRequired(false);
        setIsReviewMode(false);
        setShowDocumentUploader(false);
        setMode("form");
      } catch (error) {
        console.error("Error parsing RO-Crate:", error);
        alert(
          "Failed to parse RO-Crate metadata. Please check the file format."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSavedCrateSelect = (data: {
    formData: any;
    reviewState?: any;
  }) => {
    setFormData(data.formData);
    if (data.reviewState) {
      setReviewState(data.reviewState);
      const hasUnreviewed = Object.values(data.reviewState).some(
        (state: any) => !state.reviewed
      );
      setIsReviewRequired(hasUnreviewed);
    }
    setIsReviewMode(false);
    setShowDocumentUploader(false);
    setMode("form");
  };

  const handleIssueSelect = (issueNumber: number) => {
    navigate("/d4d-assistant", {
      state: { fromCreateRelease: true, issueNumber },
    });
  };

  const handleCrateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = parseRoCrateMetadata(content);
        setFormData(parsedData);
        setUploadedCrate(file);

        const initialReviewState: ReviewState = {};
        releaseFormConfig.sections.forEach((section) => {
          initialReviewState[section.id] = { reviewed: false };
        });
        initialReviewState["subCrates"] = { reviewed: false };
        setReviewState(initialReviewState);
        setIsReviewRequired(true);
        setIsReviewMode(true);
        setShowDocumentUploader(false);

        setMode("form");
      } catch (error) {
        console.error("Error parsing RO-Crate:", error);
        alert(
          "Failed to parse RO-Crate metadata. Please check the file format."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleLLMAssist = async (documents: UploadedFile[]) => {
    setIsLoadingLLM(true);
    try {
      const suggestedData = await llmApi.processDocuments(documents);
      setFormData((prev) => ({
        ...prev,
        ...suggestedData,
        hasPart: prev.hasPart || [],
        subCrates: prev.subCrates || [],
      }));
      setIsReviewRequired(true);
      setShowDocumentUploader(false);
      setMode("form");
    } catch (error) {
      console.error("LLM assist error:", error);
    } finally {
      setIsLoadingLLM(false);
    }
  };

  const handleSkipToManual = () => {
    const defaults: FormData = {};
    releaseFormConfig.sections.forEach((section) => {
      section.fields.forEach((field: any) => {
        if (field.defaultValue === "today") {
          defaults[field.name] = new Date().toISOString().split("T")[0];
        } else if (field.defaultValue) {
          defaults[field.name] = field.defaultValue;
        } else {
          defaults[field.name] = "";
        }
      });
    });
    defaults.hasPart = [];
    defaults.subCrates = [];
    setFormData(defaults);
    setIsReviewRequired(false);
    setShowDocumentUploader(false);
    setMode("form");
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (saveStatus === "saved") {
      setSaveStatus("idle");
    }
  };

  const handleSectionReview = (sectionId: string) => {
    const newReviewState = {
      ...reviewState,
      [sectionId]: {
        reviewed: true,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "Current User",
      },
    };
    setReviewState(newReviewState);

    saveCrate(formData, newReviewState);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const handleVisibilityChange = (
    newVisibility: "minimal" | "ai-ready" | "all"
  ) => {
    setFieldVisibility(newVisibility);
  };

  const handleSave = async () => {
    setSaveStatus("saving");

    const crateId = formData["@id"] || formData.identifier;

    if (crateId && checkCrateExists(crateId)) {
      if (
        !window.confirm(
          `A saved crate with ID "${crateId}" already exists. Do you want to overwrite it?`
        )
      ) {
        setSaveStatus("idle");
        return;
      }
    }

    const success = saveCrate(
      formData,
      isReviewRequired ? reviewState : undefined
    );

    if (success) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
      alert("Failed to save crate. Please try again.");
    }
  };

  const isAllSectionsReviewed = () => {
    if (!isReviewRequired) return true;
    return Object.entries(reviewState).every(
      ([sectionId, state]) => sectionId === "subCrates" || state.reviewed
    );
  };

  const handleDownload = () => {
    if (!isAllSectionsReviewed()) {
      alert("Please review and acknowledge all sections before downloading.");
      return;
    }

    const jsonOutput = generateReleaseJson(formData);

    const blob = new Blob([JSON.stringify(jsonOutput, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ro-crate-metadata.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    setMode("landing");
    setCurrentMethod(null);
    setShowDocumentUploader(false);
    setFormData({});
    setSupportingDocs([]);
    setReviewState({});
    setIsReviewRequired(false);
    setIsReviewMode(false);
    setSaveStatus("idle");
    setFieldVisibility("all");
  };

  const getReviewProgress = () => {
    const total = Object.keys(reviewState).length;
    const reviewed = Object.values(reviewState).filter(
      (state) => state.reviewed
    ).length;
    return { reviewed, total };
  };

  const getFilteredConfig = () => {
    return filterFieldsByVisibility(releaseFormConfig, fieldVisibility);
  };

  return (
    <PageContainer>
      <PageTitle>Create a Fairscape Release</PageTitle>

      {mode === "landing" && (
        <UnifiedStartingPage
          onMethodSelect={handleCreateMethod}
          onUploadExisting={handleUploadExisting}
          onCrateUpload={handleCrateUpload}
          onSavedCrateSelect={handleSavedCrateSelect}
          onIssueSelect={handleIssueSelect}
        />
      )}

      {mode === "form" && showDocumentUploader && (
        <DocumentUploader
          supportingDocs={supportingDocs}
          onDocsChange={setSupportingDocs}
          onLLMAssist={handleLLMAssist}
          onSkipToManual={handleSkipToManual}
          onSave={handleSave}
          saveStatus={saveStatus}
          isLoading={isLoadingLLM}
          onSavedCrateSelect={handleSavedCrateSelect}
        />
      )}

      {mode === "form" && !showDocumentUploader && (
        <MainContent>
          <FormColumn>
            <FormManager
              formData={formData}
              onFieldChange={handleFieldChange}
              reviewState={reviewState}
              isReviewRequired={isReviewRequired}
              isReviewMode={isReviewMode}
              onSectionReview={handleSectionReview}
              config={getFilteredConfig()}
            />
          </FormColumn>

          <ActionSidebar
            onDownload={handleDownload}
            onSave={handleSave}
            onStartOver={handleStartOver}
            saveStatus={saveStatus}
            isAllSectionsReviewed={isAllSectionsReviewed()}
            isReviewRequired={isReviewRequired}
            reviewProgress={isReviewRequired ? getReviewProgress() : undefined}
            visibility={fieldVisibility}
            onVisibilityChange={handleVisibilityChange}
          />
        </MainContent>
      )}
    </PageContainer>
  );
};

const MainContent = styled.div`
  display: flex;
  gap: 30px;
  align-items: flex-start;
`;

const FormColumn = styled.div`
  flex: 1;
  min-width: 0;
`;

export default CreateRelease;
