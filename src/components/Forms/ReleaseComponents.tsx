import React from "react";
import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 8px 12px 40px;
`;

export const Card = styled.div`
  background: #fff;
  border: 1px solid #e7e7e9;
  border-radius: 2px;
  padding: 18px;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    border-color 0.12s ease;
  outline: none;

  &:hover,
  &:focus {
    border-color: #3e7aa8;
  }
`;

export const StyledButton = styled.button<{ variant?: string }>`
  margin-left: auto;
  background: transparent;
  border: 1px solid #e2e8ea;
  color: #51626b;
  border-radius: 2px;
  width: 28px;
  height: 28px;
  line-height: 1;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.12s ease,
    color 0.12s ease,
    border-color 0.12s ease;

  &:hover,
  &:focus {
    background: #fff1f2;
    color: #b91c1c;
    border-color: #fecaca;
  }
`;

const FieldWrapper = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  font-size: 0.95rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
  }
`;

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) => {
  return (
    <FieldWrapper>
      <Label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </Label>
      <StyledInput
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </FieldWrapper>
  );
};

interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  rows = 3,
}) => {
  return (
    <FieldWrapper>
      <Label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </Label>
      <StyledTextArea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </FieldWrapper>
  );
};

export const Divider = styled.hr`
  margin: 30px 0;
  border: none;
  border-top: 1px solid #e0e0e0;
`;

export const InfoText = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 20px;
`;

export const ErrorMessage = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 2px;
  font-size: 13px;
  margin-bottom: 8px;
  background: ${(e) => (e.complete ? "#d4edda" : "#fff3cd")};
  color: ${(e) => (e.complete ? "#155724" : "#856404")};
  border: 1px solid ${(e) => (e.complete ? "#c3e6cb" : "#ffeeba")};

  svg {
    font-size: 14px;
  }
`;

export const SuccessMessage = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 2px;
  padding: 20px;
`;
