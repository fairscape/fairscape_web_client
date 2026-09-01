import React, { useRef, useState, useCallback } from "react";
import {
  UploaderContainer,
  UploaderHeader,
  UploaderTitle,
  DropZone,
  DropZoneContent,
  UploadIcon,
  DropText,
  BrowseButton,
  FileInput,
  SupportedFormats,
} from "./FileUploader.styles";

interface FileUploaderProps {
  onFilesUpload: (files: File[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const items = e.dataTransfer.items;
      const files: File[] = [];

      const processEntry = async (entry: any): Promise<void> => {
        if (entry.isFile) {
          return new Promise((resolve) => {
            entry.file((file: File) => {
              files.push(file);
              resolve();
            });
          });
        } else if (entry.isDirectory) {
          const reader = entry.createReader();
          return new Promise((resolve) => {
            reader.readEntries(async (entries: any[]) => {
              for (const subEntry of entries) {
                await processEntry(subEntry);
              }
              resolve();
            });
          });
        }
      };

      const processItems = async () => {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.webkitGetAsEntry) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
              await processEntry(entry);
            }
          } else {
            const file = item.getAsFile();
            if (file) {
              files.push(file);
            }
          }
        }

        if (files.length > 0) {
          onFilesUpload(files);
        }
      };

      processItems();
    },
    [onFilesUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesUpload(Array.from(files));
      }
      if (e.target) {
        e.target.value = "";
      }
    },
    [onFilesUpload],
  );

  const handleBrowseFiles = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleBrowseFolders = useCallback(() => {
    folderInputRef.current?.click();
  }, []);

  return (
    <UploaderContainer>
      <UploaderHeader>
        <UploaderTitle>Upload Files</UploaderTitle>
      </UploaderHeader>

      <DropZone
        $isDragging={isDragging}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <DropZoneContent>
          <UploadIcon>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15V3M12 3L8 7M12 3L16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L2.621 19.485C2.72915 19.9177 2.97882 20.3018 3.33033 20.5763C3.68184 20.8508 4.11501 21.0002 4.561 21H19.439C19.885 21.0002 20.3182 20.8508 20.6697 20.5763C21.0212 20.3018 21.2708 19.9177 21.379 19.485L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </UploadIcon>
          <DropText>
            Drag and drop files or folders here
            <br />
            or
          </DropText>
          <div style={{ display: "flex", gap: "12px" }}>
            <BrowseButton type="button" onClick={handleBrowseFiles}>
              Browse Files
            </BrowseButton>
            <BrowseButton
              type="button"
              onClick={handleBrowseFolders}
              style={{
                backgroundColor: "transparent",
                color: "#007bff",
                border: "1px solid #007bff",
              }}
            >
              Browse Folder
            </BrowseButton>
          </div>
          <SupportedFormats>
            Supports all file types - Upload single or multiple files, or entire
            directories
          </SupportedFormats>
        </DropZoneContent>
      </DropZone>

      <FileInput
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
      />

      <FileInput
        ref={folderInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        webkitdirectory=""
        directory=""
      />
    </UploaderContainer>
  );
};

export default FileUploader;
