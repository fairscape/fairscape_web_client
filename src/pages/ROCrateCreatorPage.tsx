import React, { useState, useCallback } from "react";

import {
  Container,
  Header,
  PageTitle,
  GenerateButtonContainer,
  GenerateButton,
} from "./ROCrateCreator.styles";

import UploadView from "../components/ROCrateCreator/views/UploadView";
import FormView from "../components/ROCrateCreator/views/FormView";
import ComputationTable from "../components/ROCrateCreator/components/ComputationTable";
import ComputationForm from "../components/ROCrateCreator/components/ComputationForm";

import {
  FileObject,
  ROCrateMetadata,
  FileType,
  DatasetMetadata,
  SoftwareMetadata,
  ComputationMetadata,
} from "../components/ROCrateCreator/types";

import {
  detectFileType,
  getDefaultMetadata,
} from "../components/ROCrateCreator/utils/fileTypeDetection";

type ViewType = "upload" | "form" | "computation-form";

export default function ROCrateCreatorPage() {
  const [currentView, setCurrentView] = useState<ViewType>("upload");
  const [files, setFiles] = useState<FileObject[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [computations, setComputations] = useState<ComputationMetadata[]>([]);
  const [selectedComputation, setSelectedComputation] =
    useState<ComputationMetadata | null>(null);

  const [roCrateMetadata, setRoCrateMetadata] = useState<ROCrateMetadata>({
    name: "",
    organizationName: "",
    projectName: "",
    description: "",
    author: "",
    keywords: [],
    version: "1.0.0",
    license: "https://creativecommons.org/licenses/by/4.0/",
  });

  const handleFilesUpload = useCallback(
    (uploadedFiles: File[]) => {
      const newFileObjects: FileObject[] = uploadedFiles.map((file) => {
        const fileType = detectFileType(file.name);
        const metadata = getDefaultMetadata(
          file,
          fileType,
          roCrateMetadata.author
        );

        return {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileData: file,
          fileType,
          metadata: metadata as DatasetMetadata | SoftwareMetadata,
          metadataComplete: false,
        };
      });

      setFiles((prev) => [...prev, ...newFileObjects]);
    },
    [roCrateMetadata.author]
  );

  const handleFileTypeChange = useCallback(
    (fileId: string, newType: FileType) => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            const metadata = getDefaultMetadata(
              file.fileData,
              newType,
              roCrateMetadata.author
            );
            return {
              ...file,
              fileType: newType,
              metadata: metadata as DatasetMetadata | SoftwareMetadata,
              metadataComplete: false,
            };
          }
          return file;
        })
      );
    },
    [roCrateMetadata.author]
  );

  const handleEditFileMetadata = useCallback((file: FileObject) => {
    setSelectedFile(file);
    setCurrentView("form");
  }, []);

  const handleMetadataSubmit = useCallback(
    (updatedMetadata: DatasetMetadata | SoftwareMetadata) => {
      if (!selectedFile) return;

      setFiles((prev) =>
        prev.map((file) => {
          if (file.id === selectedFile.id) {
            const isComplete = validateMetadata(updatedMetadata);
            return {
              ...file,
              metadata: updatedMetadata,
              metadataComplete: isComplete,
            };
          }
          return file;
        })
      );

      setCurrentView("upload");
      setSelectedFile(null);
    },
    [selectedFile]
  );

  const validateMetadata = (
    metadata: DatasetMetadata | SoftwareMetadata
  ): boolean => {
    if (metadata.type === "dataset") {
      const ds = metadata as DatasetMetadata;
      return !!(
        ds.name &&
        ds.author &&
        ds.description &&
        ds.datePublished &&
        ds.version
      );
    } else {
      const sw = metadata as SoftwareMetadata;
      return !!(
        sw.name &&
        sw.author &&
        sw.description &&
        sw.dateModified &&
        sw.version
      );
    }
  };

  const handleBackToUpload = useCallback(() => {
    setCurrentView("upload");
    setSelectedFile(null);
    setSelectedComputation(null);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const handleAddComputation = useCallback(() => {
    setSelectedComputation(null);
    setCurrentView("computation-form");
  }, []);

  const handleEditComputation = useCallback(
    (computation: ComputationMetadata) => {
      setSelectedComputation(computation);
      setCurrentView("computation-form");
    },
    []
  );

  const handleComputationSubmit = useCallback(
    (computation: ComputationMetadata) => {
      if (selectedComputation) {
        setComputations((prev) =>
          prev.map((c) => (c.id === selectedComputation.id ? computation : c))
        );
      } else {
        const newComputation = {
          ...computation,
          id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        setComputations((prev) => [...prev, newComputation]);
      }
      setCurrentView("upload");
      setSelectedComputation(null);
    },
    [selectedComputation]
  );

  const handleGenerateROCrate = useCallback(() => {
    const allMetadataComplete = files.every((file) => file.metadataComplete);
    if (!allMetadataComplete) {
      alert(
        "Please complete metadata for all files before generating RO-Crate"
      );
      return;
    }

    console.log("Generating RO-Crate with:", {
      roCrateMetadata,
      files,
      computations,
    });
  }, [roCrateMetadata, files, computations]);

  const canGenerateROCrate = () => {
    const allFilesComplete =
      files.length > 0 && files.every((f) => f.metadataComplete);
    const hasRequiredRoCrateFields = !!(
      roCrateMetadata.name &&
      roCrateMetadata.organizationName &&
      roCrateMetadata.projectName &&
      roCrateMetadata.description
    );
    return allFilesComplete && hasRequiredRoCrateFields;
  };

  const getGenerateButtonText = () => {
    if (
      !roCrateMetadata.name ||
      !roCrateMetadata.organizationName ||
      !roCrateMetadata.projectName ||
      !roCrateMetadata.description
    ) {
      return "Complete RO-Crate Details";
    }
    if (files.some((f) => !f.metadataComplete)) {
      return "Complete All File Metadata";
    }
    return "Generate RO-Crate Package";
  };

  return (
    <Container>
      <Header>
        <PageTitle>Create RO-Crate Package</PageTitle>
      </Header>

      {currentView === "upload" ? (
        <>
          <UploadView
            roCrateMetadata={roCrateMetadata}
            onRoCrateMetadataChange={setRoCrateMetadata}
            files={files}
            onFilesUpload={handleFilesUpload}
            onFileTypeChange={handleFileTypeChange}
            onEditFileMetadata={handleEditFileMetadata}
            onRemoveFile={handleRemoveFile}
          />

          {files.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <ComputationTable
                computations={computations}
                onAddComputation={handleAddComputation}
                onEditComputation={handleEditComputation}
              />
            </div>
          )}

          {files.length > 0 && (
            <GenerateButtonContainer>
              <GenerateButton
                onClick={handleGenerateROCrate}
                disabled={!canGenerateROCrate()}
              >
                {getGenerateButtonText()}
              </GenerateButton>
            </GenerateButtonContainer>
          )}
        </>
      ) : currentView === "form" ? (
        <FormView
          file={selectedFile!}
          onSubmit={handleMetadataSubmit}
          onCancel={handleBackToUpload}
        />
      ) : (
        <ComputationForm
          files={files}
          computation={selectedComputation}
          onSubmit={handleComputationSubmit}
          onCancel={handleBackToUpload}
        />
      )}
    </Container>
  );
}
