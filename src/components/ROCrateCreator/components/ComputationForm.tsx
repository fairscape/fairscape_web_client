import React, { useState } from "react";
import { FileObject, ComputationMetadata } from "../types";
import {
  ComponentContainer,
  ComponentHeader,
  ComponentTitle,
  FormGrid,
  FormGroup,
  Label,
  Input,
  TextArea,
  DragDropSection,
  Column,
  ColumnHeader,
  DropZone,
  FileItem,
  FormActions,
  Button,
} from "./ComputationComponents.styles";

interface ComputationFormProps {
  files: FileObject[];
  computation?: ComputationMetadata | null;
  onSubmit: (computation: ComputationMetadata) => void;
  onCancel: () => void;
}

const ComputationForm: React.FC<ComputationFormProps> = ({
  files,
  computation,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ComputationMetadata>(
    computation || {
      name: "",
      runBy: "",
      dateCreated: new Date().toISOString().split("T")[0],
      description: "",
      keywords: [],
      command: "",
      usedSoftware: [],
      usedDataset: [],
      generated: [],
    }
  );

  const [fileAssignments, setFileAssignments] = useState<{
    available: FileObject[];
    inputs: FileObject[];
    outputs: FileObject[];
    software: FileObject[];
  }>({
    available: files,
    inputs: [],
    outputs: [],
    software: [],
  });

  const handleDragStart = (
    e: React.DragEvent,
    file: FileObject,
    source: string
  ) => {
    e.dataTransfer.setData("fileId", file.id);
    e.dataTransfer.setData("source", source);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, destination: string) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("fileId");
    const source = e.dataTransfer.getData("source");

    if (source === destination) return;

    const file = [
      ...fileAssignments.available,
      ...fileAssignments.inputs,
      ...fileAssignments.outputs,
      ...fileAssignments.software,
    ].find((f) => f.id === fileId);

    if (!file) return;

    setFileAssignments((prev) => {
      const newAssignments = { ...prev };

      newAssignments[source as keyof typeof newAssignments] = newAssignments[
        source as keyof typeof newAssignments
      ].filter((f) => f.id !== fileId);

      newAssignments[destination as keyof typeof newAssignments] = [
        ...newAssignments[destination as keyof typeof newAssignments],
        file,
      ];

      return newAssignments;
    });
  };

  const handleSubmit = () => {
    const updatedComputation: ComputationMetadata = {
      ...formData,
      keywords:
        typeof formData.keywords === "string"
          ? (formData.keywords as any).split(",").map((k: string) => k.trim())
          : formData.keywords,
      usedSoftware: fileAssignments.software.map((f) => f.id),
      usedDataset: fileAssignments.inputs.map((f) => f.id),
      generated: fileAssignments.outputs.map((f) => f.id),
    };
    onSubmit(updatedComputation);
  };

  const handleInputChange = (field: keyof ComputationMetadata, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderDropZone = (
    columnName: string,
    columnKey: keyof typeof fileAssignments,
    acceptedType?: "dataset" | "software"
  ) => (
    <Column>
      <ColumnHeader>{columnName}</ColumnHeader>
      <DropZone
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, columnKey)}
      >
        {fileAssignments[columnKey]
          .filter((f) => !acceptedType || f.fileType === acceptedType)
          .map((file) => (
            <FileItem
              key={file.id}
              draggable
              onDragStart={(e) => handleDragStart(e, file, columnKey)}
            >
              {file.metadata.name} ({file.fileType})
            </FileItem>
          ))}
      </DropZone>
    </Column>
  );

  return (
    <ComponentContainer>
      <ComponentHeader>
        <ComponentTitle>
          {computation ? "Edit Computation" : "Add Computation"}
        </ComponentTitle>
      </ComponentHeader>

      <FormGrid>
        <FormGroup>
          <Label>Computation Name *</Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Data Processing Pipeline"
          />
        </FormGroup>

        <FormGroup>
          <Label>Run By *</Label>
          <Input
            type="text"
            value={formData.runBy}
            onChange={(e) => handleInputChange("runBy", e.target.value)}
            placeholder="e.g., John Doe"
          />
        </FormGroup>

        <FormGroup>
          <Label>Date Created *</Label>
          <Input
            type="date"
            value={formData.dateCreated}
            onChange={(e) => handleInputChange("dateCreated", e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Keywords</Label>
          <Input
            type="text"
            value={
              Array.isArray(formData.keywords)
                ? formData.keywords.join(", ")
                : formData.keywords
            }
            onChange={(e) => handleInputChange("keywords", e.target.value)}
            placeholder="e.g., analysis, processing, genomics"
          />
        </FormGroup>

        <FormGroup $fullWidth>
          <Label>Description *</Label>
          <TextArea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe what this computation does..."
            rows={4}
          />
        </FormGroup>

        <FormGroup $fullWidth>
          <Label>Command (Optional)</Label>
          <TextArea
            value={formData.command || ""}
            onChange={(e) => handleInputChange("command", e.target.value)}
            placeholder="e.g., python analyze.py --input data.csv --output results.csv"
            rows={2}
          />
        </FormGroup>
      </FormGrid>

      <Label style={{ marginBottom: "12px" }}>
        Drag files to assign them to this computation:
      </Label>

      <DragDropSection>
        {renderDropZone("Available Files", "available")}
        {renderDropZone("Input Datasets", "inputs", "dataset")}
        {renderDropZone("Output Datasets", "outputs", "dataset")}
        {renderDropZone("Software Used", "software", "software")}
      </DragDropSection>

      <FormActions>
        <Button $variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Computation</Button>
      </FormActions>
    </ComponentContainer>
  );
};

export default ComputationForm;
