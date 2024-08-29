import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";
import LoginComponent from "./LoginComponent";

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

const OutputContainer = styled.pre`
  margin-top: 20px;
  padding: 10px;
  background-color: #3e3e3e;
  border-radius: 5px;
  color: #ffffff;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const StyledModal = styled(Modal)`
  .modal-content {
    background-color: #282828;
    color: #ffffff;
  }
`;

function UploadForm({ packagedPath }) {
  const [crate, setCrate] = useState(null);
  const [output, setOutput] = useState("");
  const [crateName, setCrateName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const crateInputRef = useRef(null);

  useEffect(() => {
    if (packagedPath) {
      const fileName = packagedPath.split("/").pop();
      setCrateName(fileName);
      setOutput(`RO-Crate selected: ${fileName}`);
    }
    checkLoginStatus();
  }, [packagedPath]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  };

  const handleCrateChange = (e) => {
    const selectedCrate = e.target.files[0];
    setCrate(selectedCrate);
    setCrateName(selectedCrate ? selectedCrate.name : "");
    setOutput(selectedCrate ? `RO-Crate selected: ${selectedCrate.name}` : "");
  };

  const handleCrateButtonClick = () => {
    crateInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    checkLoginStatus();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!crate && !packagedPath) {
      setOutput("Please select an RO-Crate to upload.");
      return;
    }
    setOutput("Starting upload...");
    const formData = new FormData();

    if (crate) {
      formData.append("crate", crate);
    } else if (packagedPath) {
      // Create a new File object from the packagedPath
      try {
        const response = await fetch(packagedPath);
        const blob = await response.blob();
        const file = new File([blob], packagedPath.split("/").pop(), {
          type: "application/zip",
        });
        formData.append("crate", file);
      } catch (error) {
        setOutput(`Error creating File from packagedPath: ${error.message}`);
        return;
      }
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "https://fairscape.net/api/rocrate/upload-async",
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

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    handleCloseLoginModal();
    console.log("User logged in:", userData);
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
        {output && <OutputContainer>{output}</OutputContainer>}
      </StyledForm>

      <StyledModal show={showLoginModal} onHide={handleCloseLoginModal}>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoginComponent onLogin={handleLogin} />
        </Modal.Body>
      </StyledModal>
    </>
  );
}

export default UploadForm;
