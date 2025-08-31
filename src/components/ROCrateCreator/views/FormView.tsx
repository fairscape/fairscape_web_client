import React, { useState, useEffect } from "react";
import {
  FormViewContainer,
  FormHeader,
  FormTitle,
  FileInfo,
  FormBody,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  ArrayInputContainer,
  ArrayItem,
  AddButton,
  RemoveButton,
  RequiredIndicator,
  HelperText,
  FormActions,
  SaveButton,
  CancelButton,
} from "./FormView.styles";
import { FileObject, DatasetMetadata } from "../types";
import { formConfig } from "./formConfig";

interface FormViewProps {
  file: FileObject;
  onSubmit: (metadata: DatasetMetadata) => void;
  onCancel: () => void;
}

const FormView: React.FC<FormViewProps> = ({ file, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<DatasetMetadata>(
    file.metadata as DatasetMetadata
  );

  const fields = formConfig[file.fileType] || formConfig.dataset;

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleArrayAdd = (fieldName: string) => {
    const currentArray = (formData as any)[fieldName] || [];
    setFormData((prev) => ({
      ...prev,
      [fieldName]: [...currentArray, ""],
    }));
  };

  const handleArrayItemChange = (
    fieldName: string,
    index: number,
    value: string
  ) => {
    const currentArray = (formData as any)[fieldName] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newArray,
    }));
  };

  const handleArrayRemove = (fieldName: string, index: number) => {
    const currentArray = (formData as any)[fieldName] || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    setFormData((prev) => ({
      ...prev,
      [fieldName]: newArray,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: any) => {
    const value = (formData as any)[field.name];

    switch (field.type) {
      case "text":
      case "date":
        return (
          <Input
            type={field.type}
            value={value || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <TextArea
            value={value || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            required={field.required}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case "array":
        const arrayValue = value || [];
        return (
          <ArrayInputContainer>
            {arrayValue.map((item: string, index: number) => (
              <ArrayItem key={index}>
                <Input
                  type="text"
                  value={item}
                  onChange={(e) =>
                    handleArrayItemChange(field.name, index, e.target.value)
                  }
                  placeholder={`Item ${index + 1}`}
                />
                <RemoveButton
                  type="button"
                  onClick={() => handleArrayRemove(field.name, index)}
                >
                  Remove
                </RemoveButton>
              </ArrayItem>
            ))}
            <AddButton type="button" onClick={() => handleArrayAdd(field.name)}>
              + Add {field.label}
            </AddButton>
          </ArrayInputContainer>
        );

      default:
        return null;
    }
  };

  return (
    <FormViewContainer>
      <FormHeader>
        <FormTitle>Edit Metadata: {file.fileData.name}</FormTitle>
        <FileInfo>
          File Type: <strong>{file.fileType}</strong> | Size:{" "}
          <strong>{(file.fileData.size / 1024).toFixed(2)} KB</strong>
        </FileInfo>
      </FormHeader>

      <FormBody onSubmit={handleSubmit}>
        {fields.map((field: any) => (
          <FormGroup key={field.name} $fullWidth={field.type === "textarea"}>
            <Label>
              {field.label}{" "}
              {field.required && <RequiredIndicator>*</RequiredIndicator>}
            </Label>
            {renderField(field)}
            {field.helperText && <HelperText>{field.helperText}</HelperText>}
          </FormGroup>
        ))}

        <FormActions>
          <CancelButton type="button" onClick={onCancel}>
            Cancel
          </CancelButton>
          <SaveButton type="submit">Save Metadata</SaveButton>
        </FormActions>
      </FormBody>
    </FormViewContainer>
  );
};

export default FormView;
