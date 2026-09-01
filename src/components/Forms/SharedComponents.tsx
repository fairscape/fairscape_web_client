import React from "react";
import styled from "styled-components";
import { Form, Button, ListGroup, Col, Row } from "react-bootstrap";

export const FormSection = styled.div`
  background-color: white;
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

export const FormSectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.015em;
  color: ${({ theme }) => theme.colors.ink};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const FormRow = styled(Form.Group).attrs({ as: Row })`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid #e0e0e0;
  align-items: center;

  > .col,
  > [class*="col-"] {
    padding-right: 5px;
    padding-left: 5px;
  }
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const FormLabel = styled(Form.Label).attrs({ column: true, sm: 4 })`
  width: 220px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  padding-right: ${({ theme }) => theme.spacing.md};
  text-align: left;
  flex-shrink: 0;
  padding-left: 0;
`;

export const FormValue = styled(Col).attrs({ sm: 8 })`
  flex: 1;
  padding-left: 0;
`;

const inputStyles = `
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #3e7aa8;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f8fcff;
  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: #789ab0;
    font-style: italic;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 100, 150, 0.2);
  }

   &:disabled {
    background-color: #e9ecef;
    opacity: 0.7;
  }
`;

export const StyledFormControl = styled(Form.Control)`
  ${inputStyles}
`;

export const StyledFormTextArea = styled(Form.Control).attrs({
  as: "textarea",
})`
  ${inputStyles}
  min-height: 100px;
  resize: vertical;
`;

interface BaseFieldProps {
  label: string;
  name: string;
  required?: boolean;
  [key: string]: any;
}

export const FormField: React.FC<
  BaseFieldProps & React.InputHTMLAttributes<HTMLInputElement>
> = ({ label, name, required, ...props }) => (
  <FormRow controlId={`form-${name}`}>
    <FormLabel>
      {label} {required && <span style={{ color: "red" }}>*</span>}
    </FormLabel>
    <FormValue>
      <StyledFormControl name={name} required={required} {...props} />
    </FormValue>
  </FormRow>
);

export const TextAreaField: React.FC<
  BaseFieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({ label, name, required, ...props }) => (
  <FormRow controlId={`form-${name}`}>
    <FormLabel>
      {label} {required && <span style={{ color: "red" }}>*</span>}
    </FormLabel>
    <FormValue>
      <StyledFormTextArea name={name} required={required} {...props} />
    </FormValue>
  </FormRow>
);

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

export const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  border: none;
  border-radius: 2px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition:
    background-color 0.2s,
    opacity 0.2s;
  min-width: 150px;
  text-align: center;

  background-color: ${({ theme, variant }) => (variant === "secondary" ? "#51626B" : variant === "success" ? theme.colors.success : variant === "danger" ? theme.colors.danger : theme.colors.primary)};

  &:hover {
    color: white;
    opacity: 0.85;
    background-color: ${({ theme, variant }) => (variant === "secondary" ? "#5a6268" : variant === "success" ? theme.colors.success : variant === "danger" ? theme.colors.danger : theme.colors.primary)};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

interface JsonLdPreviewProps {
  jsonLdData: Record<string, any>;
}

export const JsonLdPreview = styled.div`
  margin-top: 30px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 2px;
  max-height: 400px;
  overflow-y: auto;

  pre {
    background-color: transparent;
    color: #333;
    padding: 0;
    margin: 0;
    font-size: 13px;
    white-space: pre-wrap;
    word-break: break-all;
    border: none;
  }
`;

export const DraggableArea = styled(Row)`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: #f8f9fa;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

export const ColumnHeader = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const StyledListGroup = styled(ListGroup)`
  min-height: 120px;
  max-height: 280px;
  overflow-y: auto;
  background-color: #ffffff;
  border: 1px solid #ced4da;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
`;

export const StyledListItem = styled(ListGroup.Item)`
  background-color: #f8fcff;
  border: 1px solid #3e7aa8;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: grab;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;

  &:hover {
    background-color: #e2f1ff;
    border-color: #1e64a6;
  }

  small {
    color: #6c757d;
    margin-left: 10px;
    white-space: nowrap;
  }
`;

export const EntityTableContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e2e8ea;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export const EntityTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;

  thead {
    border-top: 2px solid ${({ theme }) => theme.colors.ink};
  }

  th,
  td {
    border-bottom: 1px solid #e2e8ea;
    padding: 9px 10px;
    text-align: left;
    vertical-align: middle;
    word-break: break-word;
  }

  th {
    background-color: ${({ theme }) => theme.colors.background};
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 10.5px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.ink3};
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover td {
    background-color: ${({ theme }) => theme.colors.primaryTint};
    cursor: default;
  }

  td:nth-child(2) {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: ${({ theme }) => theme.fonts.mono};
    font-size: 0.8rem;
  }
`;

export const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.ink};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

export const Card = styled.div`
  background-color: white;
  padding: ${({ theme }) => {
    var t;
    return ((t = theme.spacing) == null ? void 0 : t.lg) || "1.5rem";
  }}; // Use theme spacing or fallback
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => {
    var t;
    return ((t = theme.spacing) == null ? void 0 : t.xl) || "2rem";
  }}; // Use theme spacing or fallback
  border: 1px solid
    ${({ theme }) => {
    var t;
    return ((t = theme.colors) == null ? void 0 : t.borderLight) || "#E2E8EA";
  }}; // Use theme color or fallback
`;

// --- New Component for Selection ---
export const SelectionGroupContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg || "1.5rem"};
  padding: ${({ theme }) => theme.spacing.md || "1rem"};
  border: 1px solid
    ${({ theme }) => {
    var t;
    return ((t = theme.colors) == null ? void 0 : t.borderLight) || "#E2E8EA";
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md || "4px"};
  background-color: #f7f9f9; // Light background for the group
`;

export const SelectionGroupTitle = styled.h5`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.primary || "#007bff"};
  margin-bottom: ${({ theme }) => theme.spacing.md || "1rem"};
`;

export const SelectionList = styled.div`
  max-height: 200px; // Limit height
  overflow-y: auto;
  padding-right: 10px; // Space for scrollbar
`;

export const SelectionItemLabel = styled(Form.Check.Label)`
  display: block; // Ensure label takes full width for easier clicking
  padding: 5px 0;
  cursor: pointer;

  &:hover {
    background-color: #ebf2f4; // Subtle hover effect
  }
`;

export const SelectionItemDetails = styled.span`
  font-size: 0.8rem;
  color: #51626b;
  margin-left: 8px;
  display: block; // Show details on new line or adjust as needed
`;
