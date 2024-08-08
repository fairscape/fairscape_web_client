import React, { useState, useEffect, useRef } from "react";
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
  display: flex;
  align-items: center;
`;

const FileNameDisplay = styled.span`
  color: #ffffff;
  margin-left: 10px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileSelectionButton = styled(Button)`
  background-color: #3e3e3e;
  border: 1px solid #555;
  color: #ffffff;
  margin-top: 10px;
  &:hover {
    background-color: #4e4e4e;
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

function UploadForm({ packagedPath }) {
  const [file, setFile] = useState(null);
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (packagedPath) {
      const fileName = packagedPath.split("/").pop();
      setFileName(fileName);
      setOutput(`File selected: ${fileName}`);
    }
  }, [packagedPath]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
    setOutput(selectedFile ? `File selected: ${selectedFile.name}` : "");
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !packagedPath) {
      setOutput("Please select a file to upload.");
      return;
    }
    setOutput("Starting upload...");
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    } else if (packagedPath) {
      formData.append("filePath", packagedPath);
    }

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
        <StyledLabel>
          Select RO-Crate File:
          {fileName && <FileNameDisplay>{fileName}</FileNameDisplay>}
        </StyledLabel>
        <HiddenFileInput
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <FileSelectionButton type="button" onClick={handleFileButtonClick}>
          {fileName ? "Change File" : "Select File"}
        </FileSelectionButton>
      </StyledFormGroup>
      <StyledButton type="submit">Upload RO-Crate</StyledButton>
      {output && <OutputContainer>{output}</OutputContainer>}
    </StyledForm>
  );
}

export default UploadForm;
