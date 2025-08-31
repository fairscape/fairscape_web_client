import React, { useState, useCallback } from "react";
import { Container, Header, PageTitle } from "./ROCrateCreator.styles";
import UploadView from "../components/ROCrateCreator/views/UploadView";
import FormView from "../components/ROCrateCreator/views/FormView";
import {
  FileObject,
  ROCrateMetadata,
  FileType,
  DatasetMetadata,
} from "../components/ROCrateCreator/types";

export default function ROCrateCreatorPage() {
  const [currentView, setCurrentView] = useState<"upload" | "form">("upload");
  const [files, setFiles] = useState<FileObject[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
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
      const newFileObjects: FileObject[] = uploadedFiles.map((file) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileData: file,
        fileType: "dataset" as FileType,
        metadata: {
          type: "dataset",
          name: file.name.replace(/\.[^/.]+$/, ""),
          author: roCrateMetadata.author || "",
          version: "1.0.0",
          datePublished: new Date().toISOString().split("T")[0],
          description: "",
          keywords: [],
          dataFormat: file.type || "application/octet-stream",
          generatedBy: null,
        } as DatasetMetadata,
        metadataComplete: false,
      }));

      setFiles((prev) => [...prev, ...newFileObjects]);
    },
    [roCrateMetadata.author]
  );

  const handleFileTypeChange = useCallback(
    (fileId: string, newType: FileType) => {
      setFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            const baseMetadata = {
              name: file.fileData.name.replace(/\.[^/.]+$/, ""),
              author: roCrateMetadata.author || "",
              version: "1.0.0",
              description: "",
              keywords: [],
            };

            let newMetadata: DatasetMetadata;
            if (newType === "dataset") {
              newMetadata = {
                ...baseMetadata,
                type: "dataset",
                datePublished: new Date().toISOString().split("T")[0],
                dataFormat: file.fileData.type || "application/octet-stream",
                generatedBy: null,
              } as DatasetMetadata;
            } else {
              newMetadata = {
                ...baseMetadata,
                type: "dataset",
                datePublished: new Date().toISOString().split("T")[0],
                dataFormat: file.fileData.type || "application/octet-stream",
                generatedBy: null,
              } as DatasetMetadata;
            }

            return {
              ...file,
              fileType: newType,
              metadata: newMetadata,
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
    (updatedMetadata: DatasetMetadata) => {
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

  const validateMetadata = (metadata: DatasetMetadata): boolean => {
    return !!(
      metadata.name &&
      metadata.author &&
      metadata.description &&
      metadata.datePublished &&
      metadata.version
    );
  };

  const handleBackToUpload = useCallback(() => {
    setCurrentView("upload");
    setSelectedFile(null);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

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
    });
  }, [roCrateMetadata, files]);

  return (
    <Container>
      <Header>
        <PageTitle>Create RO-Crate Package</PageTitle>
      </Header>

      {currentView === "upload" ? (
        <UploadView
          roCrateMetadata={roCrateMetadata}
          onRoCrateMetadataChange={setRoCrateMetadata}
          files={files}
          onFilesUpload={handleFilesUpload}
          onFileTypeChange={handleFileTypeChange}
          onEditFileMetadata={handleEditFileMetadata}
          onRemoveFile={handleRemoveFile}
          onGenerateROCrate={handleGenerateROCrate}
        />
      ) : (
        <FormView
          file={selectedFile!}
          onSubmit={handleMetadataSubmit}
          onCancel={handleBackToUpload}
        />
      )}
    </Container>
  );
}
