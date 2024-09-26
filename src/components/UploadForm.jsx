import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import StatusTracker from "./StatusTracker";

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

const CrateNameDisplay = styled.span`
  color: #ffffff;
  margin-left: 10px;
`;

const HiddenCrateInput = styled.input`
  display: none;
`;

const CrateSelectionButton = styled(Button)`
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

const StyledAlert = styled(Alert)`
  margin-top: 20px;
`;

function UploadForm({ packagedPath }) {
  const [crate, setCrate] = useState(null);
  const [crateName, setCrateName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissionUUID, setSubmissionUUID] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const crateInputRef = useRef(null);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    if (packagedPath) {
      const fileName = packagedPath.split("/").pop();
      setCrateName(fileName);
    }
    checkLoginStatus();
  }, [packagedPath]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
    return !!token;
  };

  const handleCrateChange = (e) => {
    const selectedCrate = e.target.files[0];
    setCrate(selectedCrate);
    setCrateName(selectedCrate ? selectedCrate.name : "");
    setSubmissionUUID(null);
    setUploadError(null);
    setIsUploading(false);
    setShowLoginWarning(false);
  };

  const handleCrateButtonClick = () => {
    crateInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isUserLoggedIn = checkLoginStatus();
    if (!isUserLoggedIn) {
      setShowLoginWarning(true);
      return;
    }

    if (!crate && !packagedPath) {
      console.error("Please select an RO-Crate to upload.");
      return;
    }

    setSubmissionUUID(null);
    setUploadError(null);
    setIsUploading(true);
    setShowLoginWarning(false);

    const formData = new FormData();

    if (crate) {
      formData.append("crate", crate);
    } else if (packagedPath) {
      try {
        const response = await fetch(packagedPath);
        const blob = await response.blob();
        const file = new File([blob], packagedPath.split("/").pop(), {
          type: "application/zip",
        });
        formData.append("crate", file);
      } catch (error) {
        console.error(
          `Error creating File from packagedPath: ${error.message}`
        );
        setIsUploading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${apiUrl}/rocrate/upload-async`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubmissionUUID(response.data.transactionFolder);
      setUploadError(null);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError({
        status: error.response ? error.response.status : "Unknown",
        message: error.response ? error.response.data.message : error.message,
      });
      setSubmissionUUID(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <StyledForm onSubmit={handleSubmit}>
        <FormTitle>Upload RO-Crate</FormTitle>
        <StyledFormGroup>
          <StyledLabel>
            Select RO-Crate:
            {crateName && <CrateNameDisplay>{crateName}</CrateNameDisplay>}
          </StyledLabel>
          <HiddenCrateInput
            type="file"
            onChange={handleCrateChange}
            ref={crateInputRef}
            accept=".zip"
          />
          <CrateSelectionButton type="button" onClick={handleCrateButtonClick}>
            {crateName ? "Change RO-Crate" : "Select RO-Crate"}
          </CrateSelectionButton>
        </StyledFormGroup>
        <StyledButton type="submit">Upload RO-Crate</StyledButton>
        {showLoginWarning && (
          <StyledAlert variant="warning">
            Please log in using the sidebar before uploading an RO-Crate.
          </StyledAlert>
        )}
        <StatusTracker
          submissionUUID={submissionUUID}
          uploadError={uploadError}
          isUploading={isUploading}
        />
      </StyledForm>
    </>
  );
}

export default UploadForm;
