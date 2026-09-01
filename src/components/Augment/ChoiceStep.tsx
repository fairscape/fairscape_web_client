// src/ChoiceStep.tsx
import React, { useRef } from "react";
import styled, { ThemeProvider } from "styled-components";
import { FiUpload, FiPlusCircle } from "react-icons/fi";
import {
  InitialReleaseFormValues,
  CrateEntity,
  AdditionalProperty,
} from "./interfaces";
import {
  parseUploadedCrate,
  mapJsonToFormData,
  mapJsonToAdditionalProperties,
  mapJsonToCustomPropertiesJson,
} from "./utils"; // Import utils
import {
  ButtonContainer,
  UploadButton,
  BaseButton,
  FileInput,
  StepContainer,
  StepTitle,
} from "./SharedComponents"; // Assuming these are in SharedComponents

interface ChoiceStepProps {
  onStartNew: () => void;
  onCrateUpload: (
    formData: InitialReleaseFormValues,
    hasPartEntities: CrateEntity[],
    additionalProperties: AdditionalProperty[],
  ) => void;
}

const ChoiceStep: React.FC<ChoiceStepProps> = ({
  onStartNew,
  onCrateUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // We only expect one file for the main release crate metadata
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);

        const uploadedCrateInfo = parseUploadedCrate(file.name, json);

        if (uploadedCrateInfo && uploadedCrateInfo.rootNode) {
          const formData = mapJsonToFormData(uploadedCrateInfo.rootNode);
          const additionalProperties = mapJsonToAdditionalProperties(
            uploadedCrateInfo.rootNode,
          );
          // Special handling for customPropertiesJson as it's a raw input
          const customPropertiesJson = mapJsonToCustomPropertiesJson(
            uploadedCrateInfo.rootNode,
          );
          formData.customPropertiesJson = customPropertiesJson;

          // Include the root node itself and all other entities as hasPart initial state
          const initialEntities: CrateEntity[] = [
            uploadedCrateInfo.rootNode, // Include the root node itself
            ...(uploadedCrateInfo.entities || []), // Include other entities from the graph
          ].filter(Boolean); // Filter out any null/undefined

          // Ensure unique entities by ID
          const uniqueEntitiesMap = new Map<string, CrateEntity>();
          initialEntities.forEach((entity) => {
            if (entity["@id"]) {
              uniqueEntitiesMap.set(entity["@id"], entity);
            }
          });
          const uniqueInitialEntities = Array.from(uniqueEntitiesMap.values());

          onCrateUpload(formData, uniqueInitialEntities, additionalProperties);
        } else {
          alert("Could not parse valid RO-Crate metadata from the file.");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        alert(
          "Failed to read or parse the file. Please ensure it's valid JSON.",
        );
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      alert("Error reading the file.");
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    };

    reader.readAsText(file);
  };

  const triggerFileUpload = () => fileInputRef.current?.click();

  return (
    <StepContainer>
      <StepTitle>Choose How to Start</StepTitle>
      <ButtonContainer>
        <BaseButton onClick={onStartNew}>
          <FiPlusCircle size={18} /> Start New Release Crate
        </BaseButton>
        <UploadButton onClick={triggerFileUpload}>
          <FiUpload size={18} /> Upload Existing ro-crate-metadata.json
        </UploadButton>
        <FileInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/ld+json"
        />
      </ButtonContainer>
    </StepContainer>
  );
};

export default ChoiceStep;
