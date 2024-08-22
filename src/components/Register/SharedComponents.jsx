// SharedComponents.js
import React from "react";
import styled from "styled-components";
import { Form, Button, ListGroup, Card } from "react-bootstrap";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";

export const StyledForm = styled(Form)`
  background-color: #282828;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

export const FormTitle = styled.h2`
  color: #ffffff;
  margin-bottom: 30px;
  text-align: center;
`;

export const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 20px;
`;

export const StyledLabel = styled(Form.Label)`
  color: #ffffff;
  font-weight: bold;
`;

export const StyledInput = styled(Form.Control)`
  background-color: #3e3e3e;
  border: 1px solid #555;
  color: #ffffff;
  &:focus {
    background-color: #3e3e3e;
    color: #ffffff;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

export const StyledTextArea = styled(StyledInput)`
  resize: vertical;
  min-height: 100px;
  width: 100%;
  padding: 10px;
`;

export const StyledButton = styled(Button)`
  background-color: #007bff;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
  margin-right: 10px;
`;

export const PreviewContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 15px;
  height: 100%;
  overflow-y: auto;
`;

export const PreviewTitle = styled.h3`
  color: #ffffff;
  margin-bottom: 15px;
  text-align: center;
`;

export const ColumnHeader = styled.h4`
  color: #ffffff;
  margin-bottom: 10px;
`;

export const StyledListGroup = styled(ListGroup)`
  background-color: #3e3e3e;
  height: 300px;
  overflow-y: auto;
  border: 1px solid #555;
  border-radius: 4px;
`;

export const StyledListItem = styled(ListGroup.Item)`
  background-color: #3e3e3e;
  color: #ffffff;
  border-color: #555;
  &:hover {
    background-color: #4e4e4e;
  }
`;

export const PropertySection = styled(Card)`
  background-color: #3e3e3e;
  border: 1px solid #555;
  margin-bottom: 20px;
  padding: 20px;
  color: #ffffff;
`;

export const PropertyList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 20px;
`;

export const PropertyItem = styled.div`
  background-color: #4e4e4e;
  border: 1px solid #666;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  color: #ffffff;
`;

export const WhiteText = styled.h4`
  color: #ffffff;
`;

export const SchemaOptionsContainer = styled.div`
  padding: 20px;
  background-color: #282828;
  border-radius: 10px;
`;

export const SchemaOptionCard = styled(Card)`
  margin-bottom: 10px;
  background-color: #3e3e3e;
  border: 1px solid #555;
  color: #ffffff;
`;

export const SchemaOptionCardBody = styled(Card.Body)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SchemaOptionCardTitle = styled(Card.Title)`
  margin: 0;
  color: #ffffff;
`;

export const SchemaOptionCardText = styled(Card.Text)`
  color: #ffffff;
`;

export const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
}) => (
  <StyledFormGroup>
    <StyledLabel>
      {label}
      {required && " *"}
    </StyledLabel>
    <StyledInput
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
    />
  </StyledFormGroup>
);

export const TextAreaField = ({
  label,
  name,
  value,
  onChange,
  required = false,
}) => (
  <StyledFormGroup>
    <StyledLabel>
      {label}
      {required && " *"}
    </StyledLabel>
    <StyledTextArea
      as="textarea"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
  </StyledFormGroup>
);

export const JsonLdPreview = ({ jsonLdData }) => (
  <PreviewContainer>
    <PreviewTitle>Preview metadata in JSON-LD</PreviewTitle>
    <SyntaxHighlighter
      language="json"
      style={vs2015}
      customStyle={{
        backgroundColor: "transparent",
        padding: "0",
        margin: "0",
        fontSize: "0.9em",
      }}
    >
      {JSON.stringify(jsonLdData, null, 2)}
    </SyntaxHighlighter>
  </PreviewContainer>
);
