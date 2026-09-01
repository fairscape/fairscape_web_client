import React from "react";
import {
  FormContainer,
  FormHeader,
  FormTitle,
  FormGrid,
  FormGroup,
  Label,
  Input,
  TextArea,
  RequiredIndicator,
  HelperText,
} from "./ROCrateForm.styles";
import { ROCrateMetadata } from "../types";

interface ROCrateFormProps {
  metadata: ROCrateMetadata;
  onChange: (metadata: ROCrateMetadata) => void;
}

const ROCrateForm: React.FC<ROCrateFormProps> = ({ metadata, onChange }) => {
  const handleInputChange = (
    field: keyof ROCrateMetadata,
    value: string | string[],
  ) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  const handleKeywordsChange = (value: string) => {
    const keywords = value
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    handleInputChange("keywords", keywords);
  };

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>RO-Crate Information</FormTitle>
      </FormHeader>

      <FormGrid>
        <FormGroup>
          <Label>
            Crate Name <RequiredIndicator>*</RequiredIndicator>
          </Label>
          <Input
            type="text"
            value={metadata.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., My Research Dataset"
          />
          <HelperText>A descriptive name for your RO-Crate package</HelperText>
        </FormGroup>

        <FormGroup>
          <Label>
            Organization Name <RequiredIndicator>*</RequiredIndicator>
          </Label>
          <Input
            type="text"
            value={metadata.organizationName}
            onChange={(e) =>
              handleInputChange("organizationName", e.target.value)
            }
            placeholder="e.g., University of Virginia"
          />
        </FormGroup>

        <FormGroup>
          <Label>
            Project Name <RequiredIndicator>*</RequiredIndicator>
          </Label>
          <Input
            type="text"
            value={metadata.projectName}
            onChange={(e) => handleInputChange("projectName", e.target.value)}
            placeholder="e.g., Genomic Data Analysis"
          />
        </FormGroup>

        <FormGroup>
          <Label>Author</Label>
          <Input
            type="text"
            value={metadata.author}
            onChange={(e) => handleInputChange("author", e.target.value)}
            placeholder="e.g., John Doe"
          />
          <HelperText>Primary author or creator of this RO-Crate</HelperText>
        </FormGroup>

        <FormGroup $fullWidth>
          <Label>
            Description <RequiredIndicator>*</RequiredIndicator>
          </Label>
          <TextArea
            value={metadata.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Provide a detailed description of this RO-Crate and its contents..."
            rows={4}
          />
        </FormGroup>

        <FormGroup $fullWidth>
          <Label>Keywords</Label>
          <Input
            type="text"
            value={metadata.keywords.join(", ")}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            placeholder="e.g., cancer, genomics, sequencing"
          />
          <HelperText>
            Comma-separated keywords to help others discover this RO-Crate
          </HelperText>
        </FormGroup>

        <FormGroup>
          <Label>Version</Label>
          <Input
            type="text"
            value={metadata.version}
            onChange={(e) => handleInputChange("version", e.target.value)}
            placeholder="1.0.0"
          />
        </FormGroup>

        <FormGroup>
          <Label>License</Label>
          <Input
            type="text"
            value={metadata.license}
            onChange={(e) => handleInputChange("license", e.target.value)}
            placeholder="https://creativecommons.org/licenses/by/4.0/"
          />
        </FormGroup>
      </FormGrid>
    </FormContainer>
  );
};

export default ROCrateForm;
