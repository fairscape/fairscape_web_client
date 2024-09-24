import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Table, Container, Button } from "react-bootstrap";
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

const StyledTable = styled(Table)`
  color: #ffffff;
  background-color: #3e3e3e;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const StyledButton = styled(Button)`
  background-color: #007bff;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
`;

function Review({ rocratePath, onContinue, setRocratePath }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rocratePath) {
      loadFiles(rocratePath);
    }
  }, [rocratePath]);

  const loadFiles = async (dirPath) => {
    try {
      const fileList = await fs.promises.readdir(dirPath);
      const metadataPath = path.join(dirPath, "ro-crate-metadata.json");

      if (!fileList.includes("ro-crate-metadata.json")) {
        setError(
          "The selected directory is not a valid RO-Crate. It should contain an ro-crate-metadata.json file."
        );
        return;
      }

      const metadata = JSON.parse(
        await fs.promises.readFile(metadataPath, "utf8")
      );

      const registeredItems = metadata["@graph"].filter(
        (item) => item.contentUrl
      );

      const fileDetails = await Promise.all(
        fileList.map(async (file) => {
          const fullPath = path.join(dirPath, file);
          const stats = await fs.promises.stat(fullPath);
          const registeredItem = registeredItems.find(
            (item) =>
              item.contentUrl === `file:///${file}` ||
              item.contentUrl === `file://${file}`
          );

          return {
            name: file,
            isRegistered: !!registeredItem,
            type: registeredItem
              ? registeredItem["@type"].split("#")[1]
              : stats.isDirectory()
              ? "Directory"
              : "File",
          };
        })
      );

      setFiles(fileDetails);
      setError(null);
    } catch (error) {
      console.error("Error reading directory or metadata:", error);
      setError(
        "Error reading directory or metadata. Please make sure the path is correct and accessible."
      );
    }
  };

  const handleSelectOrChangeCrate = async () => {
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

  if (!rocratePath) {
    return (
      <StyledContainer>
        <StyledTitle>Review Files</StyledTitle>
        <p>Please select an RO-Crate directory to review.</p>
        <StyledButton onClick={handleSelectOrChangeCrate}>
          Select RO-Crate
        </StyledButton>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledTitle>Review Files</StyledTitle>
      {error ? (
        <>
          <p>{error}</p>
          <StyledButton onClick={handleSelectOrChangeCrate}>
            Select Different RO-Crate
          </StyledButton>
        </>
      ) : files.length > 0 ? (
        <>
          <StyledTable striped bordered hover>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Registered</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.isRegistered ? "Yes" : "No"}</td>
                  <td>{file.type}</td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
          <ButtonContainer>
            <StyledButton onClick={onContinue}>
              Continue to Package
            </StyledButton>
            <StyledButton
              onClick={handleSelectOrChangeCrate}
              variant="secondary"
            >
              Change RO-Crate
            </StyledButton>
          </ButtonContainer>
        </>
      ) : (
        <>
          <p>No files found in the selected RO-Crate directory.</p>
          <StyledButton onClick={handleSelectOrChangeCrate}>
            Select Different RO-Crate
          </StyledButton>
        </>
      )}
    </StyledContainer>
  );
}

export default Review;
