import React from "react";
import {
  ViewContainer,
  GenerateButtonContainer,
  GenerateButton,
} from "./UploadView.styles";
import ROCrateForm from "../components/ROCrateForm";
import FileUploader from "../components/FileUploader";
import FileTrackingTable from "../components/FileTrackingTable";
import { FileObject, ROCrateMetadata, FileType } from "../types";

interface UploadViewProps {
  roCrateMetadata: ROCrateMetadata;
  onRoCrateMetadataChange: (metadata: ROCrateMetadata) => void;
  files: FileObject[];
  onFilesUpload: (files: File[]) => void;
  onFileTypeChange: (fileId: string, type: FileType) => void;
  onEditFileMetadata: (file: FileObject) => void;
  onRemoveFile: (fileId: string) => void;
  onGenerateROCrate: () => void;
}

const UploadView: React.FC<UploadViewProps> = ({
  roCrateMetadata,
  onRoCrateMetadataChange,
  files,
  onFilesUpload,
  onFileTypeChange,
  onEditFileMetadata,
  onRemoveFile,
  onGenerateROCrate,
}) => {
  const allFilesComplete =
    files.length > 0 && files.every((f) => f.metadataComplete);
  const hasRequiredRoCrateFields = !!(
    roCrateMetadata.name &&
    roCrateMetadata.organizationName &&
    roCrateMetadata.projectName &&
    roCrateMetadata.description
  );

  return (
    <ViewContainer>
      <ROCrateForm
        metadata={roCrateMetadata}
        onChange={onRoCrateMetadataChange}
      />

      <FileUploader onFilesUpload={onFilesUpload} />

      {files.length > 0 && (
        <FileTrackingTable
          files={files}
          onFileTypeChange={onFileTypeChange}
          onEditMetadata={onEditFileMetadata}
          onRemoveFile={onRemoveFile}
        />
      )}

      {files.length > 0 && (
        <GenerateButtonContainer>
          <GenerateButton
            onClick={onGenerateROCrate}
            disabled={!allFilesComplete || !hasRequiredRoCrateFields}
          >
            {!hasRequiredRoCrateFields
              ? "Complete RO-Crate Details"
              : !allFilesComplete
              ? "Complete All File Metadata"
              : "Generate RO-Crate Package"}
          </GenerateButton>
        </GenerateButtonContainer>
      )}
    </ViewContainer>
  );
};

export default UploadView;
