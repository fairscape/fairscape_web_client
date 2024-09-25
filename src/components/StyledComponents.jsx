import styled from "styled-components";
import React from "react";
import { Form, Button, Col, Container, Row, Modal } from "react-bootstrap";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";

const accentColor = "#1976D2";
const accentColorHover = "#2196F3";

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #121212;
  color: #ffffff;
`;

const Sidebar = styled.div`
  width: 200px;
  background-color: #000000;
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
`;

const SidebarContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
`;

const SidebarFooter = styled.div`
  margin-top: auto;
`;

const SidebarItem = styled.div`
  padding: 10px;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 4px;
  color: white;
  &:hover {
    background-color: #282828;
  }
  ${(props) =>
    props.active &&
    `
    background-color: ${accentColor};
    &:hover {
      background-color: ${accentColorHover};
    }
  `}
`;

const SidebarSubItem = styled.div`
  padding: 10px 20px 10px 40px;
  cursor: pointer;
  background-color: ${(props) => (props.active ? accentColor : "transparent")};
  color: ${(props) => (props.active ? "#ffffff" : "inherit")};
  &:hover {
    background-color: ${(props) =>
      props.active ? accentColorHover : "#333333"};
    color: #ffffff;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-left: 200px;
`;

const StyledForm = styled(Form)`
  background-color: #282828;
  padding: 20px;
  border-radius: 8px;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
`;

const InitStyledForm = styled(Form)`
  background-color: #282828;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 15px;
`;

const StyledFormControl = styled(Form.Control)`
  background-color: #3e3e3e;
  border: none;
  color: #ffffff;
  &:focus {
    background-color: #3e3e3e;
    color: #ffffff;
    box-shadow: 0 0 0 0.2rem rgba(25, 118, 210, 0.25);
  }
`;

const StyledButton = styled(Button)`
  background-color: ${accentColor};
  border: none;
  &:hover,
  &:focus,
  &:active {
    background-color: ${accentColorHover};
  }
`;

const OutputBox = styled.pre`
  background-color: #282828;
  color: ${accentColor};
  padding: 15px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 20px;
`;

const SmallerCol = styled(Col)`
  flex: 0 0 20%;
  max-width: 20%;
`;

const LargerCol = styled(Col)`
  flex: 0 0 60%;
  max-width: 60%;
`;

export const StyledContainer = styled(Container)`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const ScrollableRow = styled(Row)`
  flex: 1;
  overflow: hidden;
`;

export const SidebarCol = styled(Col)`
  padding-right: 15px;
  border-right: 1px solid #ddd;
  height: 100%;
  overflow-y: auto;
`;

export const ContentCol = styled(Col)`
  padding-left: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const StyledOutputBox = styled.div`
  margin-top: 20px;
  flex: 1;
  overflow-y: auto;
`;

const MainContentWrapper = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  margin-left: 200px; // This should match the width of your Sidebar
  background-color: #121212;
  color: #ffffff;
`;

const FormTitle = styled.h3`
  color: #ffffff;
  margin-bottom: 10px;
  text-align: center;
`;

const StyledLabel = styled(Form.Label)`
  color: #ffffff;
  font-weight: bold;
`;

const StyledInput = styled(Form.Control)`
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

const StyledTextArea = styled(StyledInput)`
  resize: vertical;
  min-height: 100px;
  width: 100%;
  padding: 10px;
`;

const StyledSelect = styled(Form.Select)`
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

const BrowseButton = styled(Button)`
  margin-top: 10px;
`;

const PreviewContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 5px;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
`;

const PreviewTitle = styled.h4`
  color: #ffffff;
  margin-bottom: 15px;
  text-align: center;
`;

const StyledModal = styled(Modal)`
  .modal-content {
    background-color: #282828;
    color: #ffffff;
  }
`;

const ModalButton = styled(Button)`
  margin-right: 10px;
`;

const RadioGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
`;

const RadioGroupLabel = styled.label`
  color: #ffffff;
  font-weight: bold;
  margin-bottom: 10px;
`;

const RadioOption = styled.div`
  margin-bottom: 8px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #ffffff;
  cursor: pointer;
  user-select: none;
`;

const RadioInput = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #007bff;
  border-radius: 50%;
  margin-right: 10px;
  outline: none;
  cursor: pointer;

  &:checked {
    background-color: #007bff;
    border: 2px solid #ffffff;
    box-shadow: 0 0 0 2px #007bff;
  }

  &:hover {
    border-color: #0056b3;
  }
`;

const RadioText = styled.span`
  font-size: 14px;
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

export const RadioGroupField = ({ label, name, options, value, onChange }) => (
  <RadioGroup>
    <RadioGroupLabel>{label}</RadioGroupLabel>
    {options.map((option) => (
      <RadioOption key={option.value}>
        <RadioLabel>
          <RadioInput
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          />
          <RadioText>{option.label}</RadioText>
        </RadioLabel>
      </RadioOption>
    ))}
  </RadioGroup>
);

export {
  MainContentWrapper,
  AppContainer,
  Sidebar,
  MainContent,
  SidebarItem,
  SidebarContent,
  SidebarFooter,
  SidebarSubItem,
  StyledForm,
  StyledFormGroup,
  StyledFormControl,
  StyledButton,
  OutputBox,
  SmallerCol,
  LargerCol,
  FormTitle,
  StyledLabel,
  StyledInput,
  StyledTextArea,
  StyledSelect,
  BrowseButton,
  PreviewContainer,
  PreviewTitle,
  StyledModal,
  ModalButton,
  RadioGroup,
  RadioGroupLabel,
  RadioOption,
  RadioLabel,
  RadioInput,
  RadioText,
  InitStyledForm,
};
