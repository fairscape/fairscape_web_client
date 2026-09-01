import React, { useState } from "react";
import ROCrateForm from "../components/ROCrateForm";
import FileUploader from "../components/FileUploader";
import ObjectInventoryTable from "../components/ObjectInventoryTable";
import {
  ViewContainer,
  SectionContainer,
  SectionHeader,
  SectionTitle,
  GenerateButtonContainer,
  GenerateButton,
  AddButton,
  ExternalFileSection,
  ExternalFileButton,
  UrlInput,
  TypeSelect,
  Modal,
  ModalContent,
  ModalActions,
} from "./WorkspaceView.styles";
import { ROCrateState, MetadataObject } from "../types";

interface WorkspaceViewProps {
  crateState: ROCrateState;
  onUpdateRoot: (updates: Partial<ROCrateState["root"]>) => void;
  onFilesUpload: (files: File[]) => Promise<void>;
  onExternalRegistration: (
    url: string,
    type: "Dataset" | "Software",
    metadata: any,
  ) => void;
  onOpenEditor: (objectId: string) => void;
  onDeleteObject: (objectId: string) => void;
  onAddComputation: () => void;
  onGenerateROCrate: () => void;
}

const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  crateState,
  onUpdateRoot,
  onFilesUpload,
  onExternalRegistration,
  onOpenEditor,
  onDeleteObject,
  onAddComputation,
  onGenerateROCrate,
}) => {
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [externalType, setExternalType] = useState<"Dataset" | "Software">(
    "Dataset",
  );
  const [externalName, setExternalName] = useState("");

  const handleExternalSubmit = () => {
    if (externalUrl && externalName) {
      onExternalRegistration(externalUrl, externalType, { name: externalName });
      setShowExternalModal(false);
      setExternalUrl("");
      setExternalName("");
    }
  };

  const allObjectsComplete = Array.from(crateState.objects.values()).every(
    (obj) => obj.validation?.isComplete,
  );

  const hasRequiredRootFields = !!(
    crateState.root.name &&
    crateState.root.organizationName &&
    crateState.root.projectName &&
    crateState.root.description
  );

  const canGenerate =
    allObjectsComplete && hasRequiredRootFields && crateState.objects.size > 0;

  const getGenerateButtonText = () => {
    if (!hasRequiredRootFields) return "Complete RO-Crate Details";
    if (!allObjectsComplete) return "Complete All Object Metadata";
    if (crateState.objects.size === 0) return "Add Files to Generate";
    return "Generate RO-Crate Package";
  };

  return (
    <ViewContainer>
      <ROCrateForm metadata={crateState.root} onChange={onUpdateRoot} />

      <FileUploader onFilesUpload={onFilesUpload} />

      <ExternalFileSection>
        <ExternalFileButton onClick={() => setShowExternalModal(true)}>
          Register External/Embargoed File
        </ExternalFileButton>
      </ExternalFileSection>

      {crateState.objects.size > 0 && (
        <ObjectInventoryTable
          objects={Array.from(crateState.objects.values())}
          onEdit={onOpenEditor}
          onDelete={onDeleteObject}
        />
      )}

      {crateState.objects.size > 0 && (
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>Computational Workflows</SectionTitle>
            <AddButton onClick={onAddComputation}>Add Computation</AddButton>
          </SectionHeader>
        </SectionContainer>
      )}

      {crateState.objects.size > 0 && (
        <GenerateButtonContainer>
          <GenerateButton onClick={onGenerateROCrate} disabled={!canGenerate}>
            {getGenerateButtonText()}
          </GenerateButton>
        </GenerateButtonContainer>
      )}

      {showExternalModal && (
        <Modal>
          <ModalContent>
            <h3>Register External Resource</h3>
            <UrlInput
              type="text"
              placeholder="URL or identifier (e.g., ark:12345/...)"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
            <UrlInput
              type="text"
              placeholder="Resource name"
              value={externalName}
              onChange={(e) => setExternalName(e.target.value)}
            />
            <TypeSelect
              value={externalType}
              onChange={(e) =>
                setExternalType(e.target.value as "Dataset" | "Software")
              }
            >
              <option value="Dataset">Dataset</option>
              <option value="Software">Software</option>
            </TypeSelect>
            <ModalActions>
              <button onClick={() => setShowExternalModal(false)}>
                Cancel
              </button>
              <button onClick={handleExternalSubmit}>Register</button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </ViewContainer>
  );
};

export default WorkspaceView;
