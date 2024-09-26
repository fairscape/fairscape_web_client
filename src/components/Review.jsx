import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Table, Container, Button } from "react-bootstrap";
import fs from "fs";
import path from "path";
import { ipcRenderer } from "electron";
import InitModal from "./InitModal";

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
    color: #ffffff;
  }

  tbody tr:nth-of-type(odd) {
    background-color: #333333;
  }

  tbody tr:hover {
    background-color: #4e4e4e;
  }
`;

const TableRow = styled.tr`
  ${(props) =>
    props.unregistered &&
    `
    background-color: rgba(255, 0, 0, 0.1) !important;
    &:hover {
      background-color: rgba(255, 0, 0, 0.2) !important;
    }
  `}
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

function Review({ rocratePath, onContinue, setRocratePath, onInitRequired }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [showInitModal, setShowInitModal] = useState(false);

  useEffect(() => {
    if (rocratePath) {
      loadItems(rocratePath);
    }
  }, [rocratePath]);

  const loadItems = async (dirPath) => {
    try {
      const fileList = await fs.promises.readdir(dirPath);
      const metadataExists = fileList.includes("ro-crate-metadata.json");

      if (!metadataExists) {
        setShowInitModal(true);
        return;
      }

      const metadataPath = path.join(dirPath, "ro-crate-metadata.json");
      const metadata = JSON.parse(
        await fs.promises.readFile(metadataPath, "utf8")
      );

      const graphItems = metadata["@graph"].reduce((acc, item) => {
        if (item.contentUrl) {
          const fileName = item.contentUrl.replace("file:///", "");
          acc[fileName] = item;
        } else if (item["@type"].includes("Computation")) {
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
            let name = file;
            let guid = "";

            if (file === "ro-crate-metadata.json") {
              type = "Metadata";
              isRegistered = true;
              name = "RO-Crate Metadata";
            } else if (graphItem) {
              type = graphItem["@type"].split("#")[1] || graphItem["@type"];
              isRegistered = true;
              name = graphItem.name || file;
              guid = graphItem["@id"] || "";
            }

            return {
              name,
              isRegistered,
              type,
              guid,
            };
          })
      );

      const computationItems = Object.values(graphItems)
        .filter((item) => item["@type"].includes("Computation"))
        .map((item) => ({
          name: item.name || "",
          isRegistered: true,
          type: "Computation",
          guid: item["@id"] || "",
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

  const handleInitialize = () => {
    setShowInitModal(false);
    onInitRequired(rocratePath);
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
      <StyledTitle>Preview RO-Crate Contents</StyledTitle>
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
                <th>Name</th>
                <th>Status</th>
                <th>Type</th>
                <th>GUID</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <TableRow key={index} unregistered={!item.isRegistered}>
                  <td>{item.name}</td>
                  <td>{item.isRegistered ? "Registered" : "Unregistered"}</td>
                  <td>{item.type}</td>
                  <td>{item.guid}</td>
                </TableRow>
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

      <InitModal
        show={showInitModal}
        onHide={() => setShowInitModal(false)}
        onInit={handleInitialize}
      />
    </StyledContainer>
  );
}

export default Review;
