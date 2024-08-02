import React, { useState } from "react";
import styled from "styled-components";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const StyledForm = styled(Form)`
  background-color: #282828;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  color: #ffffff;
  margin-bottom: 30px;
  text-align: center;
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 20px;
`;

const StyledLabel = styled(Form.Label)`
  color: #ffffff;
  font-weight: bold;
`;

const StyledFileInput = styled(Form.Control)`
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

const StyledButton = styled(Button)`
  background-color: #007bff;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
`;

const OutputContainer = styled.pre`
  margin-top: 20px;
  padding: 10px;
  background-color: #3e3e3e;
  border-radius: 5px;
  color: #ffffff;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

function UploadForm() {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setOutput("Please select a file to upload.");
      return;
    }
    setOutput("Starting upload...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://fairscape.net/api/rocrate/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setOutput(`Upload progress: ${percentCompleted}%`);
          },
        }
      );
      setOutput(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error("Upload error:", error);
      setOutput(
        `Error: ${error.message}\n\nResponse data: ${JSON.stringify(
          error.response?.data,
          null,
          2
        )}`
      );
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormTitle>Upload RO-Crate</FormTitle>
      <StyledFormGroup>
        <StyledLabel>Select RO-Crate File</StyledLabel>
        <StyledFileInput type="file" onChange={handleFileChange} required />
      </StyledFormGroup>
      <StyledButton type="submit">Upload RO-Crate</StyledButton>
      {output && <OutputContainer>{output}</OutputContainer>}
    </StyledForm>
  );
}

export default UploadForm;
