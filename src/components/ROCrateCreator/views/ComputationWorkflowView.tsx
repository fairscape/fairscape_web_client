import React, { useMemo, useState } from "react";
import {
  ViewContainer,
  WorkflowHeader,
  WorkflowTitle,
  FormSection,
  FormGrid,
  FormGroup,
  Label,
  Input,
  TextArea,
  DragDropSection,
  Column,
  ColumnHeader,
  DropZone,
  ObjectCard,
  ActionBar,
  SaveButton,
  CancelButton,
  RequiredIndicator,
  HelperText,
} from "./ComputationWorkflowView.styles";
import { DataObject, ComputationObject } from "../types";

type BucketKey = "available" | "inputs" | "outputs" | "software";

interface ObjectAssignment {
  available: DataObject[];
  inputs: DataObject[];
  outputs: DataObject[];
  software: DataObject[];
}

interface Props {
  datasets: DataObject[];
  software: DataObject[];
  existingComputations: ComputationObject[];
  onSave: (computation: Partial<ComputationObject>) => void;
  onCancel: () => void;
}

const ComputationWorkflowView: React.FC<Props> = ({
  datasets,
  software,
  existingComputations,
  onSave,
  onCancel,
}) => {
  const initialAvailable = useMemo(
    () => [...datasets, ...software],
    [datasets, software],
  );

  const [formData, setFormData] = useState<Partial<ComputationObject>>({
    name: "",
    runBy: "",
    dateCreated: new Date().toISOString().split("T")[0],
    description: "",
    keywords: [],
    command: "",
    usedSoftware: [],
    usedDataset: [],
    generated: [],
  });

  const [assignments, setAssignments] = useState<ObjectAssignment>({
    available: initialAvailable,
    inputs: [],
    outputs: [],
    software: [],
  });

  const [dragged, setDragged] = useState<DataObject | null>(null);
  const [hovering, setHovering] = useState<BucketKey | null>(null);

  const handleInputChange = (field: keyof ComputationObject, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDragStart = (
    e: React.DragEvent,
    item: DataObject,
    source: BucketKey,
  ) => {
    setDragged(item);
    e.dataTransfer.setData("source", source);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, destination: BucketKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHovering(destination);
  };

  const handleDrop = (e: React.DragEvent, destination: BucketKey) => {
    e.preventDefault();
    const source =
      (e.dataTransfer.getData("source") as BucketKey) || "available";
    if (!dragged) return;

    setAssignments((prev) => {
      const cleaned: ObjectAssignment = {
        available: prev.available.filter((x) => x["@id"] !== dragged["@id"]),
        inputs: prev.inputs.filter((x) => x["@id"] !== dragged["@id"]),
        outputs: prev.outputs.filter((x) => x["@id"] !== dragged["@id"]),
        software: prev.software.filter((x) => x["@id"] !== dragged["@id"]),
      };
      cleaned[destination] = [...cleaned[destination], dragged];
      return cleaned;
    });

    setDragged(null);
    setHovering(null);
  };

  const handleDragLeave = () => setHovering(null);

  const handleSubmit = () => {
    const keywords =
      typeof formData.keywords === "string"
        ? (formData.keywords as any)
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean)
        : formData.keywords;

    const computation: Partial<ComputationObject> = {
      ...formData,
      keywords,
      usedSoftware: assignments.software.map((s) => s["@id"]),
      usedDataset: assignments.inputs.map((d) => d["@id"]),
      generated: assignments.outputs.map((d) => d["@id"]),
    };

    onSave(computation);
  };

  const isValid = formData.name && formData.runBy && formData.description;

  const renderDropZone = (
    title: string,
    key: BucketKey,
    items: DataObject[],
    hint?: string,
  ) => (
    <Column>
      <ColumnHeader>
        {title} {items.length ? `(${items.length})` : ""}
      </ColumnHeader>
      <DropZone
        onDragOver={(e) => handleDragOver(e, key)}
        onDrop={(e) => handleDrop(e, key)}
        onDragLeave={handleDragLeave}
        $isDragging={hovering === key}
      >
        {items.map((item) => (
          <ObjectCard
            key={item["@id"]}
            draggable
            onDragStart={(e) => handleDragStart(e, item, key)}
            title={
              Array.isArray((item as any)["@type"])
                ? (item as any)["@type"].join(", ")
                : String((item as any)["@type"] ?? "")
            }
          >
            <span>{item.name || item["@id"]}</span>
            <span>
              {Array.isArray((item as any)["@type"])
                ? (item as any)["@type"][(item as any)["@type"].length - 1]
                : String((item as any)["@type"] ?? "")}
            </span>
          </ObjectCard>
        ))}
        {items.length === 0 && (
          <div style={{ padding: "20px", color: "#999", textAlign: "center" }}>
            {hint || "Drop objects here"}
          </div>
        )}
      </DropZone>
    </Column>
  );

  return (
    <ViewContainer>
      <WorkflowHeader>
        <WorkflowTitle>Create Computational Workflow</WorkflowTitle>
      </WorkflowHeader>

      <FormSection>
        <FormGrid>
          <FormGroup>
            <Label>
              Computation Name <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Data Processing Pipeline"
            />
          </FormGroup>

          <FormGroup>
            <Label>
              Run By <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <Input
              type="text"
              value={formData.runBy || ""}
              onChange={(e) => handleInputChange("runBy", e.target.value)}
              placeholder="e.g., Research Team"
            />
          </FormGroup>

          <FormGroup>
            <Label>Date Created</Label>
            <Input
              type="date"
              value={formData.dateCreated || ""}
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
                  : (formData.keywords as any)
              }
              onChange={(e) => handleInputChange("keywords", e.target.value)}
              placeholder="e.g., analysis, processing, pipeline"
            />
            <HelperText>Comma-separated keywords</HelperText>
          </FormGroup>

          <FormGroup $fullWidth>
            <Label>
              Description <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <TextArea
              value={formData.description || ""}
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
            <HelperText>
              Command or script used to run this computation
            </HelperText>
          </FormGroup>
        </FormGrid>
      </FormSection>

      <DragDropSection>
        {renderDropZone(
          "Available Objects",
          "available",
          assignments.available,
        )}
        {renderDropZone("Input Datasets", "inputs", assignments.inputs)}
        {renderDropZone("Output Datasets", "outputs", assignments.outputs)}
        {renderDropZone("Software Used", "software", assignments.software)}
      </DragDropSection>

      <ActionBar>
        <CancelButton onClick={onCancel}>Cancel</CancelButton>
        <SaveButton onClick={handleSubmit} disabled={!isValid}>
          Save Computation
        </SaveButton>
      </ActionBar>
    </ViewContainer>
  );
};

export default ComputationWorkflowView;
