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
import { useLLMAssistApi } from "../components/Forms/api/llmAssistAPI";
import { useFairscapeApi } from "../components/Forms/api/fairscapeApi";
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

interface ProvenanceState {
  inputArk: string;
  computationArk: string;
  outputArk: string;
  sourceFlow: "manual" | "direct" | "chatbot";
  requiresGithubPush: boolean;
  yamlUrl?: string;
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
  const fairscapeApi = useFairscapeApi();
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
  const [llmStatus, setLlmStatus] = useState<{state: string, message: string, elapsedSeconds: number} | null>(null);
  const [provenance, setProvenance] = useState<ProvenanceState | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [fieldVisibility, setFieldVisibility] = useState<
    "minimal" | "ai-ready" | "all"
  >("all");
  const [showDocumentUploader, setShowDocumentUploader] = useState(false);
  const [finalArk, setFinalArk] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const state = location.state as any;
    console.log("=== CreateReleasePage useEffect ===");
    console.log("Full location.state:", state);

    if (state && state.fromD4D && state.rocrate) {
      console.log("Detected D4D flow initialization");
      console.log("state.rocrate type:", typeof state.rocrate);
      console.log("state.rocrate preview:",
        typeof state.rocrate === "string"
          ? state.rocrate.substring(0, 200)
          : state.rocrate
      );

      try {
        // Handle case where rocrate is a string containing JSON
        let rocrateObj;
        if (typeof state.rocrate === "string") {
          console.log("Parsing rocrate from string...");
          rocrateObj = JSON.parse(state.rocrate);
          console.log("Parsed rocrate object:", rocrateObj);
        } else {
          rocrateObj = state.rocrate;
        }

        // Convert back to string for parseRoCrateMetadata
        const content = JSON.stringify(rocrateObj);
        console.log("Content to parse (length):", content.length);

        const parsedData = parseRoCrateMetadata(content);
        console.log("Parsed form data:", parsedData);
        console.log("Form data keys:", Object.keys(parsedData));
        console.log("Sample values:", {
          name: parsedData.name,
          description: parsedData.description?.substring(0, 100),
          keywords: parsedData.keywords,
        });

        setFormData(parsedData);

        if (state.provenance) {
          console.log("Setting provenance:", state.provenance);
          setProvenance(state.provenance);
        } else {
          console.warn("No provenance data found in state");
        }

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

        console.log("Form initialization complete!");
      } catch (error) {
        console.error("!!! Error initializing form from RO-Crate:", error);
        console.error("Error details:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        alert(`Failed to load RO-Crate data: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      console.log("Not D4D flow or missing data:", {
        hasState: !!state,
        fromD4D: state?.fromD4D,
        hasRocrate: !!state?.rocrate,
      });
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

  useEffect(() => {
    if (provenance) {
      setIsReviewRequired(true);
    }
  }, [provenance]);

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
    provenance?: ProvenanceState | null;
    finalArk?: string | null;
  }) => {
    setFormData(data.formData);
    if (data.reviewState) {
      setReviewState(data.reviewState);
      const hasUnreviewed = Object.values(data.reviewState).some(
        (state: any) => !state.reviewed
      );
      setIsReviewRequired(hasUnreviewed);
    }
    if (data.provenance) {
      setProvenance(data.provenance);
    }
    if (data.finalArk) {
      setFinalArk(data.finalArk);
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
    setLlmStatus({state: "PENDING", message: "Starting...", elapsedSeconds: 0});
    console.log("=== handleLLMAssist (Direct Flow) ===");

    try {
      const suggestedData = await llmApi.processDocuments(documents, {
        onProgress: (status) => setLlmStatus(status)
      });
      console.log("LLM API response:", suggestedData);

      const { result, provenance } = suggestedData;
      console.log("Result type:", typeof result);
      console.log("Result preview:",
        typeof result === "string" ? result.substring(0, 200) : result
      );

      // Convert result to string if it's not already
      const rocrateString = typeof result === "string"
        ? result
        : JSON.stringify(result);

      console.log("Parsing RO-Crate with parseRoCrateMetadata...");
      const parsedFormData = parseRoCrateMetadata(rocrateString);
      console.log("Parsed form data:", parsedFormData);
      console.log("Form data keys:", Object.keys(parsedFormData));

      setFormData(parsedFormData);

      if (provenance) {
        console.log("Setting provenance:", provenance);
        setProvenance({
          inputArk: provenance.inputArk,
          computationArk: provenance.computationArk,
          outputArk: provenance.outputArk,
          sourceFlow: "direct",
          requiresGithubPush: false,
        });
      } else {
        console.warn("No provenance data received from LLM API");
      }

      setIsReviewRequired(true);
      setShowDocumentUploader(false);
      setMode("form");

      console.log("Direct flow initialization complete!");
      setLlmStatus(null);
    } catch (error) {
      console.error("!!! LLM assist error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      alert(`Failed to process documents: ${error instanceof Error ? error.message : String(error)}`);
      setLlmStatus(null);
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
    setProvenance(null);
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

    saveCrate(formData, newReviewState, provenance, finalArk);
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
      isReviewRequired ? reviewState : undefined,
      provenance,
      finalArk
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

  const handleFinalize = async () => {
    if (!isAllSectionsReviewed()) {
      alert("Please review all sections before uploading");
      return;
    }

    setIsUploading(true);

    try {
      const finalRoCrate = generateReleaseJson(formData);

      console.log("=== Uploading to Fairscape ===");
      console.log("Has provenance:", !!provenance);
      if (provenance) {
        console.log("Base dataset ARK:", provenance.outputArk);
      }

      // Step 1: Upload to Fairscape with optional annotation
      await fairscapeApi.uploadRoCrate(
        finalRoCrate,
        provenance?.outputArk
      );

      // Extract the @id from the generated RO-Crate (it's in @graph[1] - the root dataset node)
      const newFinalArk = finalRoCrate["@graph"][1]["@id"];
      console.log("Upload successful! Final ARK:", newFinalArk);
      setFinalArk(newFinalArk);

      // Save the finalArk to storage
      saveCrate(formData, isReviewRequired ? reviewState : undefined, provenance, newFinalArk);

      // Step 2: If D4D flow, update GitHub YAML
      if (provenance?.requiresGithubPush && provenance.yamlUrl) {
        // TODO: Need RO-Crate → YAML conversion first
        // For now, just log that this step is pending
        console.log("GitHub repush pending - need RO-Crate to YAML conversion");

        /* Will be:
        const yamlContent = convertRoCrateToYaml(finalRoCrate);
        await fairscapeApi.updateGitHubFile(
          provenance.yamlUrl,
          yamlContent,
          'Update D4D from Fairscape review'
        );
        */
      }

      // Offer download before navigating
      const shouldDownload = window.confirm(
        `Successfully uploaded to Fairscape!\nARK: ${newFinalArk}\n\nWould you like to download a local copy before viewing the metadata page?`
      );

      if (shouldDownload) {
        handleDownload();
      }

      // Navigate to the metadata landing page
      navigate(`/view/${newFinalArk}`);
    } catch (error: any) {
      console.error("Finalization error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
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
          isLoading={!!llmStatus}
          loadingStatus={llmStatus}
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
            onFinalize={handleFinalize}
            onSave={handleSave}
            onStartOver={handleStartOver}
            saveStatus={saveStatus}
            isAllSectionsReviewed={isAllSectionsReviewed()}
            isReviewRequired={isReviewRequired}
            reviewProgress={isReviewRequired ? getReviewProgress() : undefined}
            visibility={fieldVisibility}
            onVisibilityChange={handleVisibilityChange}
            provenance={provenance}
            finalArk={finalArk}
            isUploading={isUploading}
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
