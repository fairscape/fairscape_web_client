import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ListGroup, Button, Container, Row, Col } from "react-bootstrap";
import DatasetForm from "./DatasetForm";
import SoftwareForm from "./SoftwareForm";
import fs from "fs";
import path from "path";
import { ipcRenderer } from "electron";

const StyledContainer = styled(Container)`
  background-color: #282828;
  color: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const StyledTitle = styled.h2`
  margin-bottom: 30px;
  text-align: center;
`;

const StyledListGroup = styled(ListGroup)`
  background-color: #3e3e3e;
`;

const StyledListGroupItem = styled(ListGroup.Item)`
  background-color: #3e3e3e;
  color: ${(props) => (props.isRegistered ? "#888" : "#ffffff")};
  border-color: #555;
  cursor: ${(props) => (props.isRegistered ? "not-allowed" : "pointer")};
  pointer-events: ${(props) => (props.isRegistered ? "none" : "auto")};
  &:hover {
    background-color: ${(props) =>
      props.isRegistered ? "#3e3e3e" : "#4e4e4e"};
  }
`;

const StyledButton = styled(Button)`
  margin-right: 10px;
  background-color: #007bff;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
`;

const CheckMark = styled.span`
  color: #28a745;
  margin-left: 10px;
`;

const DoneButton = styled(StyledButton)`
  margin-top: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const RightAlignedButton = styled(StyledButton)`
  margin-left: auto;
`;

function FileSelector({
  rocratePath,
  setRocratePath,
  onDoneRegistering,
  onFileRegister,
}) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState(null);
  const [registeredFiles, setRegisteredFiles] = useState([]);

  const readFilesRecursively = async (dir, baseDir) => {
    let results = [];
    const items = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (item.isDirectory()) {
        results = results.concat(await readFilesRecursively(fullPath, baseDir));
      } else if (
        item.isFile() &&
        item.name !== "ro-crate-metadata.json" &&
        item.name !== ".DS_Store"
      ) {
        results.push(relativePath);
      }
    }

    return results;
  };

  const normalizePath = (filePath) =>
    filePath.replace(/^\//, "").replace(/\\/g, "/");

  useEffect(() => {
    const loadFiles = async () => {
      try {
        if (!rocratePath) {
          setError("Please select an RO-Crate directory.");
          return;
        }

        const fileList = await fs.promises.readdir(rocratePath);
        const metadataExists = fileList.includes("ro-crate-metadata.json");

        if (!metadataExists) {
          setError(
            "The selected directory is not a valid RO-Crate. It should contain an ro-crate-metadata.json file."
          );
          return;
        }

        const filteredFiles = await readFilesRecursively(
          rocratePath,
          rocratePath
        );

        if (filteredFiles.length === 0) {
          setError(
            "No files found in the RO-Crate directory. Please add files to the selected folder."
          );
        } else {
          setFiles(filteredFiles);
          setError(null);

          // Load registered files from ro-crate-metadata.json
          const metadataPath = path.join(rocratePath, "ro-crate-metadata.json");
          const metadata = JSON.parse(
            await fs.promises.readFile(metadataPath, "utf8")
          );
          const registeredFiles = metadata["@graph"]
            .filter((item) => item.contentUrl)
            .map((item) =>
              normalizePath(item.contentUrl.replace("file://", ""))
            );
          setRegisteredFiles(registeredFiles);
        }
      } catch (error) {
        console.error("Error reading directory or metadata:", error);
        setError(
          "Error reading directory or metadata. Please make sure the path is correct and accessible."
        );
        setFiles([]);
      }
    };

    loadFiles();
  }, [rocratePath, registeredFiles]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setFileType(null);
  };

  const handleTypeSelect = (type) => {
    setFileType(type);
  };

  const handleBack = () => {
    if (fileType) {
      setFileType(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleBrowse = async () => {
    try {
      const result = await ipcRenderer.invoke("open-directory-dialog");
      if (result.filePaths && result.filePaths.length > 0) {
        setRocratePath(result.filePaths[0]);
      }
    } catch (error) {
      console.error("Failed to open directory dialog:", error);
      setError("Failed to open directory dialog. Please try again.");
    }
  };

  const handleChangeCrate = async () => {
    try {
      const result = await ipcRenderer.invoke("open-directory-dialog");
      if (result.filePaths && result.filePaths.length > 0) {
        setRocratePath(result.filePaths[0]);
        setSelectedFile(null);
        setFileType(null);
        setFiles([]);
        setRegisteredFiles([]);
        setError(null);
      }
    } catch (error) {
      console.error("Failed to open directory dialog:", error);
      setError("Failed to open directory dialog. Please try again.");
    }
  };

  if (selectedFile && fileType) {
    return fileType === "dataset" ? (
      <DatasetForm
        file={selectedFile}
        onBack={handleBack}
        rocratePath={rocratePath}
        onSuccess={() => {
          onFileRegister();
          setSelectedFile(null);
          setFileType(null);
        }}
      />
    ) : (
      <SoftwareForm
        file={selectedFile}
        onBack={handleBack}
        rocratePath={rocratePath}
        onSuccess={() => {
          onFileRegister();
          setSelectedFile(null);
          setFileType(null);
        }}
      />
    );
  }

  return (
    <StyledContainer>
      <StyledTitle>Register Objects</StyledTitle>
      {!rocratePath ? (
        <Row>
          <Col>
            <p>Please select an RO-Crate directory:</p>
            <StyledButton onClick={handleBrowse}>Browse</StyledButton>
          </Col>
        </Row>
      ) : selectedFile ? (
        <Row>
          <Col>
            <h3>Is {selectedFile} a dataset or software?</h3>
            <StyledButton onClick={() => handleTypeSelect("dataset")}>
              Dataset
            </StyledButton>
            <StyledButton onClick={() => handleTypeSelect("software")}>
              Software
            </StyledButton>
            <StyledButton onClick={handleBack} variant="secondary">
              Back
            </StyledButton>
          </Col>
        </Row>
      ) : (
        <>
          <Row>
            <Col>
              <h3>Select a file to add metadata:</h3>
            </Col>
          </Row>
          <Row>
            <Col>
              {error ? (
                <p>{error}</p>
              ) : (
                <StyledListGroup>
                  {files.map((file) => (
                    <StyledListGroupItem
                      key={file}
                      action
                      onClick={() => handleFileSelect(file)}
                      isRegistered={registeredFiles.includes(
                        normalizePath(file)
                      )}
                    >
                      {file}
                      {registeredFiles.includes(normalizePath(file)) && (
                        <CheckMark>✓</CheckMark>
                      )}
                    </StyledListGroupItem>
                  ))}
                </StyledListGroup>
              )}
            </Col>
          </Row>
          {files.length === 0 && !error && (
            <Row>
              <Col>
                <p>No files found in the RO-Crate directory.</p>
              </Col>
            </Row>
          )}
          <ButtonContainer>
            {files.length > 0 && (
              <DoneButton onClick={onDoneRegistering}>
                Done Registering
              </DoneButton>
            )}
            <RightAlignedButton onClick={handleChangeCrate} variant="secondary">
              Change RO-Crate
            </RightAlignedButton>
          </ButtonContainer>
        </>
      )}
    </StyledContainer>
  );
}

export default FileSelector;
