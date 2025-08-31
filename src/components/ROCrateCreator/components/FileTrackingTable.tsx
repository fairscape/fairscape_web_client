import React from "react";
import {
  TableContainer,
  TableHeader,
  TableTitle,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  FileTypeSelect,
  StatusBadge,
  ActionButton,
  RemoveButton,
  FileNameCell,
  ButtonGroup,
} from "./FileTrackingTable.styles";
import { FileObject, FileType } from "../types";

interface FileTrackingTableProps {
  files: FileObject[];
  onFileTypeChange: (fileId: string, type: FileType) => void;
  onEditMetadata: (file: FileObject) => void;
  onRemoveFile: (fileId: string) => void;
}

const FileTrackingTable: React.FC<FileTrackingTableProps> = ({
  files,
  onFileTypeChange,
  onEditMetadata,
  onRemoveFile,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <TableContainer>
      <TableHeader>
        <TableTitle>Uploaded Files ({files.length})</TableTitle>
      </TableHeader>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>File Name</TableHeaderCell>
            <TableHeaderCell>Size</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Metadata Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>
                <FileNameCell>{file.fileData.name}</FileNameCell>
              </TableCell>
              <TableCell>{formatFileSize(file.fileData.size)}</TableCell>
              <TableCell>
                <FileTypeSelect
                  value={file.fileType}
                  onChange={(e) =>
                    onFileTypeChange(file.id, e.target.value as FileType)
                  }
                >
                  <option value="dataset">Dataset</option>
                  <option value="software">Software</option>
                  <option value="computation">Computation</option>
                  <option value="schema">Schema</option>
                </FileTypeSelect>
              </TableCell>
              <TableCell>
                <StatusBadge $isComplete={file.metadataComplete}>
                  {file.metadataComplete ? "Complete" : "Incomplete"}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <ButtonGroup>
                  <ActionButton
                    onClick={() => onEditMetadata(file)}
                    $variant={file.metadataComplete ? "secondary" : "primary"}
                  >
                    {file.metadataComplete ? "Edit" : "Add Metadata"}
                  </ActionButton>
                  <RemoveButton onClick={() => onRemoveFile(file.id)}>
                    Remove
                  </RemoveButton>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FileTrackingTable;
