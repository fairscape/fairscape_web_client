import React from "react";
import styled from "styled-components";

export const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

export const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
`;

export const StyledButton = styled.button<{ variant?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant }) => {
    switch (variant) {
      case "secondary":
        return `
          background-color: #6c757d;
          color: white;
          &:hover {
            background-color: #5a6268;
          }
        `;
      case "danger":
        return `
          background-color: #dc3545;
          color: white;
          &:hover {
            background-color: #c82333;
          }
        `;
      default:
        return `
          background-color: #3e7aa8;
          color: white;
          &:hover {
            background-color: #2c5f8d;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FieldWrapper = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;

  span.required {
    color: #dc3545;
    margin-left: 4px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
    box-shadow: 0 0 0 2px rgba(62, 122, 168, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
    box-shadow: 0 0 0 2px rgba(62, 122, 168, 0.1);
  }

  &::placeholder {
    color: #999;
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
  font-size: 14px;
  margin-bottom: 15px;
`;

export const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
  margin-bottom: 20px;
`;

export const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #c3e6cb;
  margin-bottom: 20px;
`;
