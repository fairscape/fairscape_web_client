import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  FiDownload,
  FiChevronRight,
  FiChevronLeft,
  FiSave,
} from "react-icons/fi";
import releaseFormConfig from "../components/Forms/config/releaseFormConfig.json";
import {
  PageContainer,
  StyledButton,
} from "../components/Forms/ReleaseComponents";
import {
  parseRoCrateMetadata,
  generateReleaseJson,
  mockLLMCall,
} from "../components/Forms/utils/releaseUtils";
import {
  saveCrate,
  checkCrateExists,
} from "../components/Forms/utils/storageUtils";
import ModeSelector from "../components/Forms/Release/ModeSelector";
import FormManager from "../components/Forms/Release/FormManager";
import DocumentUploader from "../components/Forms/Release/DocumentUploader";
import EditSelectionPage from "../components/Forms/Release/EditSelectionPage";

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
  const [mode, setMode] = useState<
    "choice" | "new" | "edit" | "review" | "form"
  >("choice");
  const [formData, setFormData] = useState<FormData>({});
  const [reviewState, setReviewState] = useState<ReviewState>({});
  const [isReviewRequired, setIsReviewRequired] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [uploadedCrate, setUploadedCrate] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<UploadedFile[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [isLoadingLLM, setIsLoadingLLM] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const crateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "form" && isReviewRequired) {
      const initialReviewState: ReviewState = {};
      releaseFormConfig.sections.forEach((section) => {
        initialReviewState[section.id] = {
          reviewed: false,
        };
      });
      initialReviewState["subCrates"] = { reviewed: false };
      setReviewState(initialReviewState);
    }
  }, [mode, isReviewRequired]);

  const handleModeSelection = (selectedMode: "new" | "edit" | "review") => {
    if (selectedMode === "review") {
      setIsReviewMode(true);
      setIsReviewRequired(true);
      crateInputRef.current?.click();
    } else if (selectedMode === "edit") {
      setMode("edit");
    } else {
      setMode(selectedMode);
      setIsReviewMode(false);
      const defaults: FormData = {};
      releaseFormConfig.sections.forEach((section) => {
        section.fields.forEach((field) => {
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
    }
  };

  const handleSavedCrateSelect = (savedFormData: FormData) => {
    setFormData(savedFormData);
    setIsReviewMode(false);
    setIsReviewRequired(false);
    setMode("form");
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
        setMode("form");
      } catch (error) {
        console.error("Error parsing RO-Crate:", error);
        alert(
          "Failed to parse RO-Crate metadata. Please check the file format."
        );
      }
    };
    reader.readAsText(file);
  };

  const handleLLMAssist = async (documents: UploadedFile[]) => {
    setIsLoadingLLM(true);
    try {
      const suggestedData = await mockLLMCall(documents);
      setFormData((prev) => ({
        ...prev,
        ...suggestedData,
        hasPart: prev.hasPart || [],
        subCrates: prev.subCrates || [],
      }));
      setIsReviewRequired(true);
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
      section.fields.forEach((field) => {
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
    setMode("form");
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (saveStatus === "saved") {
      setSaveStatus("idle");
    }
  };

  const handleSectionReview = (sectionId: string) => {
    setReviewState((prev) => ({
      ...prev,
      [sectionId]: {
        reviewed: true,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "Current User",
      },
    }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");

    const crateId = formData["@id"] || formData.identifier;
    const crateName = formData.name || formData.title || "Unnamed Crate";

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

    const success = saveCrate(formData);

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
    return Object.values(reviewState).every((state) => state.reviewed);
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

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved!";
      case "error":
        return "Save Failed";
      default:
        return "Save Progress";
    }
  };

  const jsonPreview = generateReleaseJson(formData);

  return (
    <PageContainer>
      <PageTitle>Create Release RO-Crate</PageTitle>

      {mode === "choice" && <ModeSelector onModeSelect={handleModeSelection} />}

      {mode === "edit" && (
        <EditSelectionPage
          onCrateUpload={handleCrateUpload}
          onSavedCrateSelect={handleSavedCrateSelect}
          onBack={() => setMode("choice")}
        />
      )}

      {mode === "new" && (
        <DocumentUploader
          supportingDocs={supportingDocs}
          onDocsChange={setSupportingDocs}
          onLLMAssist={handleLLMAssist}
          onSkipToManual={handleSkipToManual}
          onSave={handleSave}
          saveStatus={saveStatus}
          isLoading={isLoadingLLM}
        />
      )}

      {mode === "form" && (
        <MainContent>
          <FormColumn>
            <FormManager
              formData={formData}
              onFieldChange={handleFieldChange}
              reviewState={reviewState}
              isReviewRequired={isReviewRequired}
              isReviewMode={isReviewMode}
              onSectionReview={handleSectionReview}
            />

            <ButtonGroup style={{ marginTop: "30px" }}>
              <StyledButton
                onClick={handleDownload}
                variant="primary"
                disabled={!isAllSectionsReviewed()}
              >
                <FiDownload />
                {isReviewRequired
                  ? "Download Reviewed Release"
                  : "Download Release Metadata"}
              </StyledButton>

              <StyledButton
                onClick={handleSave}
                variant="secondary"
                disabled={saveStatus === "saving"}
              >
                <FiSave />
                {getSaveButtonText()}
              </StyledButton>

              <StyledButton
                variant="secondary"
                onClick={() => {
                  setMode("choice");
                  setFormData({});
                  setSupportingDocs([]);
                  setReviewState({});
                  setIsReviewRequired(false);
                  setIsReviewMode(false);
                  setSaveStatus("idle");
                }}
              >
                Start Over
              </StyledButton>
            </ButtonGroup>
          </FormColumn>

          <PreviewColumn showPreview={showPreview}>
            <PreviewToggle
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? "Collapse preview" : "Expand preview"}
            >
              {showPreview ? <FiChevronRight /> : <FiChevronLeft />}
            </PreviewToggle>
            {showPreview && (
              <>
                <PreviewHeader>JSON Preview</PreviewHeader>
                <PreviewContent>
                  <pre>{JSON.stringify(jsonPreview, null, 2)}</pre>
                </PreviewContent>
              </>
            )}
          </PreviewColumn>
        </MainContent>
      )}

      <input
        ref={crateInputRef}
        type="file"
        accept=".json"
        onChange={handleCrateUpload}
        style={{ display: "none" }}
      />
    </PageContainer>
  );
};

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #3e7aa8;
  text-align: center;
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

const PreviewColumn = styled.div<{ showPreview: boolean }>`
  width: ${(props) => (props.showPreview ? "450px" : "40px")};
  position: sticky;
  top: 20px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
`;

const PreviewToggle = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  background: #3e7aa8;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 1;

  &:hover {
    background: #2c5f8d;
  }
`;

const PreviewHeader = styled.div`
  background: #3e7aa8;
  color: white;
  padding: 15px 15px 15px 55px;
  border-radius: 8px 8px 0 0;
  font-weight: bold;
`;

const PreviewContent = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  max-height: calc(100vh - 180px);

  pre {
    margin: 0;
    font-size: 12px;
    line-height: 1.4;
    color: #333;
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

export default CreateRelease;
