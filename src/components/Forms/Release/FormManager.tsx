import React from "react";
import styled from "styled-components";
import FormSection from "./FormSection";

interface FormManagerProps {
  formData: any;
  onFieldChange: (fieldName: string, value: any) => void;
  reviewState: any;
  isReviewRequired: boolean;
  isReviewMode: boolean;
  onSectionReview: (sectionId: string) => void;
  config?: any;
}

const FormManager: React.FC<FormManagerProps> = ({
  formData,
  onFieldChange,
  reviewState,
  isReviewRequired,
  isReviewMode,
  onSectionReview,
  config,
}) => {
  const renderField = (field: any) => {
    const showAIReadyBadge = field.aiReady === true && !field.required;

    return (
      <FieldWrapper key={field.name}>
        <FieldLabelRow>
          <FieldLabel>
            {field.label}
            {field.required && <RequiredStar>*</RequiredStar>}
          </FieldLabel>
          {showAIReadyBadge && <AIReadyBadge>AI-Ready</AIReadyBadge>}
        </FieldLabelRow>

        {field.type === "textarea" ? (
          <TextArea
            value={formData[field.name] || ""}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
          />
        ) : field.type === "select" ? (
          <Select
            value={formData[field.name] || ""}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            type={field.type || "text"}
            value={formData[field.name] || ""}
            onChange={(e) => onFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )}

        {field.helpText && <HelpText>{field.helpText}</HelpText>}
      </FieldWrapper>
    );
  };

  return (
    <FormContainer>
      {config?.sections.map((section: any) => (
        <Section key={section.id}>
          <SectionHeader>
            <SectionTitle>{section.title}</SectionTitle>
            {isReviewRequired && reviewState[section.id]?.reviewed && (
              <ReviewedBadge>✓ Reviewed</ReviewedBadge>
            )}
          </SectionHeader>

          {section.description && (
            <SectionDescription>{section.description}</SectionDescription>
          )}

          {section.fields.map(renderField)}

          {isReviewRequired && !reviewState[section.id]?.reviewed && (
            <ReviewButton onClick={() => onSectionReview(section.id)}>
              Mark Section as Reviewed
            </ReviewButton>
          )}
        </Section>
      ))}
    </FormContainer>
  );
};

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  color: #333;
  margin: 0;
`;

const SectionDescription = styled.p`
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const ReviewedBadge = styled.span`
  background: #4caf50;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const FieldWrapper = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const FieldLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const FieldLabel = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

const RequiredStar = styled.span`
  color: #d32f2f;
  margin-left: 2px;
`;

const AIReadyBadge = styled.span`
  background: #2196f3;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
  }
`;

const HelpText = styled.p`
  margin-top: 6px;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
`;

const ReviewButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2d5f7f;
    transform: translateY(-1px);
  }
`;

export default FormManager;
