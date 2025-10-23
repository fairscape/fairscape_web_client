import React from "react";
import styled from "styled-components";
import { ReviewStates } from "../types/reviewTypes";
import FieldReviewBadge from "./FieldReviewBadge";
import KeywordSelector from "../Release/KeywordSelector";

interface EditFormManagerProps {
  config: any;
  formData: any;
  onFieldChange: (fieldName: string, value: any) => void;
  reviewStates?: ReviewStates;
  onReviewAction?: (fieldName: string, action: "approve" | "reject") => void;
}

const EditFormManager: React.FC<EditFormManagerProps> = ({
  config,
  formData,
  onFieldChange,
  reviewStates = {},
  onReviewAction,
}) => {
  if (!config || !config.sections) {
    return <div>No form configuration available</div>;
  }

  const renderField = (field: any) => {
    const value = formData[field.name];
    const reviewState = reviewStates[field.name];

    const fieldStyle = reviewState
      ? {
          border: `2px solid ${
            reviewState.status === "pending"
              ? "#f59e0b"
              : reviewState.status === "approved"
              ? "#10b981"
              : "#ef4444"
          }`,
          backgroundColor:
            reviewState.status === "pending"
              ? "#fffbeb"
              : reviewState.status === "approved"
              ? "#f0fdf4"
              : "#fef2f2",
        }
      : {};

    return (
      <FieldContainer key={field.name}>
        <FieldLabel>
          {field.label}
          {field.required && <Required>*</Required>}
          {reviewState && (
            <FieldReviewBadge
              status={reviewState.status}
              onApprove={() => onReviewAction?.(field.name, "approve")}
              onReject={() => onReviewAction?.(field.name, "reject")}
              showActions={reviewState.status === "pending"}
            />
          )}
        </FieldLabel>

        {field.description && (
          <FieldDescription>{field.description}</FieldDescription>
        )}

        {field.type === "text" && (
          <TextInput
            type="text"
            value={value || ""}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            style={fieldStyle}
          />
        )}

        {field.type === "textarea" && (
          <TextArea
            value={value || ""}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            style={fieldStyle}
          />
        )}

        {field.type === "select" && (
          <Select
            value={value || ""}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            style={fieldStyle}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}

        {field.type === "number" && (
          <TextInput
            type="number"
            value={value || ""}
            onChange={(e) =>
              onFieldChange(field.name, parseFloat(e.target.value))
            }
            placeholder={field.placeholder}
            style={fieldStyle}
          />
        )}

        {field.type === "date" && (
          <TextInput
            type="date"
            value={value || ""}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            style={fieldStyle}
          />
        )}

        {field.type === "email" && (
          <TextInput
            type="email"
            value={value || ""}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            style={fieldStyle}
          />
        )}

        {field.type === "keywords" && (
          <KeywordSelector
            value={value || ""}
            onChange={(newValue) => onFieldChange(field.name, newValue)}
            required={field.required}
          />
        )}

        {field.type === "array" && (
          <ArrayField
            value={value || []}
            onChange={(newValue) => onFieldChange(field.name, newValue)}
            placeholder={field.placeholder}
            fieldStyle={fieldStyle}
          />
        )}
      </FieldContainer>
    );
  };

  return (
    <Container>
      {config.sections.map((section: any) => (
        <Section key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.description && (
            <SectionDescription>{section.description}</SectionDescription>
          )}
          <FieldsGrid>
            {section.fields?.map((field: any) => renderField(field))}
          </FieldsGrid>
        </Section>
      ))}
    </Container>
  );
};

const ArrayField: React.FC<{
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  fieldStyle?: any;
}> = ({ value, onChange, placeholder, fieldStyle }) => {
  const addItem = () => {
    onChange([...value, ""]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newValue: string) => {
    const updated = [...value];
    updated[index] = newValue;
    onChange(updated);
  };

  return (
    <div>
      {value.map((item, index) => (
        <ArrayItemContainer key={index}>
          <TextInput
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
            style={fieldStyle}
          />
          <RemoveButton onClick={() => removeItem(index)}>×</RemoveButton>
        </ArrayItemContainer>
      ))}
      <AddButton onClick={addItem}>+ Add Item</AddButton>
    </div>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const SectionDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 20px 0;
`;

const FieldsGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
`;

const Required = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const FieldDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: -4px;
`;

const TextInput = styled.input`
  padding: 10px 12px;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ArrayItemContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

const RemoveButton = styled.button`
  padding: 8px 12px;
  font-size: 1.25rem;
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fee2e2;
  }
`;

const AddButton = styled.button`
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dbeafe;
  }
`;

export default EditFormManager;
