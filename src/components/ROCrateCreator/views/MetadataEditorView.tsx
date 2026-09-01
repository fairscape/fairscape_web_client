import React, { useEffect, useMemo, useState } from "react";
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

import { MetadataObject } from "../types";
import { formConfig } from "./formConfig";

interface MetadataEditorViewProps {
  objectId: string;
  object?: MetadataObject;
  allObjects: Map<string, MetadataObject>;
  onSave: (updatedObject: MetadataObject) => void;
  onCancel: () => void;
}

const MetadataEditorView: React.FC<MetadataEditorViewProps> = ({
  objectId,
  object,
  allObjects,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<MetadataObject | null>(null);

  // Initialize local state from the incoming object
  useEffect(() => {
    if (object) {
      // clone to avoid mutating the store directly
      setFormData({ ...(object as any) });
    } else {
      setFormData(null);
    }
  }, [object]);

  // Pick the right config section based on @type (defaults to dataset fields)
  const fields = useMemo(() => {
    const typeKey = (object?.["@type"] ?? "Dataset")
      .toString()
      .toLowerCase() as "dataset" | "software" | "computation" | "schema";
    return (formConfig as any)[typeKey] ?? formConfig.dataset;
  }, [object]);

  const handleFieldChange = (fieldName: string, value: any) => {
    if (!formData) return;
    setFormData((prev) => ({ ...(prev as any), [fieldName]: value }) as any);
  };

  const handleArrayAdd = (fieldName: string) => {
    if (!formData) return;
    const currentArray = ((formData as any)[fieldName] as any[]) ?? [];
    setFormData((prev) => ({
      ...(prev as any),
      [fieldName]: [...currentArray, ""],
    }));
  };

  const handleArrayItemChange = (
    fieldName: string,
    index: number,
    value: string,
  ) => {
    if (!formData) return;
    const currentArray = ((formData as any)[fieldName] as any[]) ?? [];
    const newArray = [...currentArray];
    newArray[index] = value;
    setFormData((prev) => ({ ...(prev as any), [fieldName]: newArray }));
  };

  const handleArrayRemove = (fieldName: string, index: number) => {
    if (!formData) return;
    const currentArray = ((formData as any)[fieldName] as any[]) ?? [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    setFormData((prev) => ({ ...(prev as any), [fieldName]: newArray }));
  };

  const renderField = (field: any) => {
    if (!formData) return null;
    const value = (formData as any)[field.name];

    switch (field.type) {
      case "text":
      case "date":
      case "number":
        return (
          <Input
            type={field.type}
            value={value ?? ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <TextArea
            value={value ?? ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            required={field.required}
          />
        );

      case "select":
        return (
          <Select
            value={value ?? ""}
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

      case "array": {
        const arrayValue = (value ?? []) as string[];
        return (
          <ArrayInputContainer>
            {arrayValue.map((item, index) => (
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
      }

      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Keep it simple—like your old FormView, rely on `required` attributes.
    // If you want the previous “validation” property stored, you can add it here:
    // (Comment out if you don't want it.)
    const updated: MetadataObject = {
      ...(formData as any),
      // validation: { isComplete: true, missingFields: [] },
    };

    onSave(updated);
  };

  if (!object || !formData) {
    return (
      <FormViewContainer>
        <FormHeader>
          <FormTitle>Object Not Found</FormTitle>
        </FormHeader>
        <FormActions>
          <CancelButton type="button" onClick={onCancel}>
            Back to Workspace
          </CancelButton>
        </FormActions>
      </FormViewContainer>
    );
  }

  return (
    <FormViewContainer>
      <FormHeader>
        <FormTitle>Edit Metadata: {formData.name || "(unnamed)"}</FormTitle>
        <FileInfo>
          Type: <strong>{formData["@type"]}</strong> | ID:{" "}
          <strong>{formData["@id"]}</strong>
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

export default MetadataEditorView;
