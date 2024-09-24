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
  border-color: #555;

  th,
  td {
    border-color: #555;
  }

  thead th {
    background-color: #4e4e4e;
  }

  tbody tr:nth-of-type(odd) {
    background-color: #333333;
  }

  tbody tr:hover {
    background-color: #4e4e4e;
  }
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

const CheckMark = styled.span`
  color: #28a745;
`;

function Review({ rocratePath, onContinue, setRocratePath }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (rocratePath) {
      loadItems(rocratePath);
    }
  }, [rocratePath]);

  const loadItems = async (dirPath) => {
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

      const graphItems = metadata["@graph"].reduce((acc, item) => {
        if (item.contentUrl) {
          const fileName = item.contentUrl.replace("file:///", "");
          acc[fileName] = item;
        } else if (item["@type"].includes("Computation")) {
          // Handle Computation items
          acc[item["@id"]] = item;
        }
        return acc;
      }, {});

      const itemDetails = await Promise.all(
        fileList
          .filter((file) => !file.startsWith("."))
          .map(async (file) => {
            const fullPath = path.join(dirPath, file);
            const stats = await fs.promises.stat(fullPath);
            const graphItem = graphItems[file];

            let type = stats.isDirectory() ? "Directory" : "File";
            let isRegistered = false;
            let displayName = "";

            if (file === "ro-crate-metadata.json") {
              type = "Metadata";
              isRegistered = true;
              displayName = "RO-Crate Metadata";
            } else if (graphItem) {
              type = graphItem["@type"].split("#")[1] || graphItem["@type"];
              isRegistered = true;
              displayName = graphItem.name || "";
            }

            return {
              name: file,
              displayName,
              isRegistered,
              type,
            };
          })
      );

      // Add Computation items
      const computationItems = Object.values(graphItems)
        .filter((item) => item["@type"].includes("Computation"))
        .map((item) => ({
          name: "",
          displayName: item.name || "",
          isRegistered: true,
          type: "Computation",
        }));

      setItems([...itemDetails, ...computationItems]);
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
        <StyledTitle>Review Items</StyledTitle>
        <p>Please select an RO-Crate directory to review.</p>
        <StyledButton onClick={handleSelectOrChangeCrate}>
          Select RO-Crate
        </StyledButton>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledTitle>Review Items</StyledTitle>
      {error ? (
        <>
          <p>{error}</p>
          <StyledButton onClick={handleSelectOrChangeCrate}>
            Select Different RO-Crate
          </StyledButton>
        </>
      ) : items.length > 0 ? (
        <>
          <StyledTable striped bordered hover>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Name</th>
                <th>Registered</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.displayName}</td>
                  <td>{item.isRegistered ? <CheckMark>✓</CheckMark> : ""}</td>
                  <td>{item.type}</td>
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
          <p>No items found in the selected RO-Crate directory.</p>
          <StyledButton onClick={handleSelectOrChangeCrate}>
            Select Different RO-Crate
          </StyledButton>
        </>
      )}
    </StyledContainer>
  );
}

export default Review;
