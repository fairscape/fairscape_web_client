import React, { useEffect, useState } from "react";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import path from "path";
import fs from "fs";
import { StyledForm, StyledButton } from "./StyledComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import helperData from "../data/helper.json";

function CommandForm({
  commands,
  selectedCommand,
  selectedSubCommand,
  options,
  rocratePath,
  handleOptionChange,
  handleRocratePathChange,
  handleSubmit,
  handleUpload,
  isExecuteDisabled,
  previousPaths,
  onSuccessfulExecution,
  onAddAnother,
}) {
  const [sourceFilePath, setSourceFilePath] = useState("");
  const [roCrateIds, setRoCrateIds] = useState([]);

  useEffect(() => {
    if (sourceFilePath && rocratePath) {
      const filename = path.basename(sourceFilePath);
      const destinationPath = path.join(rocratePath, filename);
      handleOptionChange("destination-filepath", destinationPath);
    }
  }, [sourceFilePath, rocratePath]);

  useEffect(() => {
    if (rocratePath) {
      const metadataPath = path.join(rocratePath, "ro-crate-metadata.json");
      fs.readFile(metadataPath, "utf8", (err, data) => {
        if (err) {
          console.error(
            `Error reading ro-crate-metadata.json from ${metadataPath}:`,
            err
          );
          return;
        }
        try {
          const metadata = JSON.parse(data);
          const ids = metadata["@graph"].map((item) => item["@id"]);
          setRoCrateIds(ids);
        } catch (parseErr) {
          console.error("Error parsing ro-crate-metadata.json:", parseErr);
        }
      });
    }
  }, [rocratePath]);

  const handleFileChange = (option, file) => {
    if (file) {
      const filePath = file.path;
      setSourceFilePath(filePath);

      if (selectedCommand === "4: Upload" && selectedSubCommand === "rocrate") {
        // For upload, store the File object
        handleOptionChange(option, file);
      } else {
        // For all other cases, store the file path
        handleOptionChange(option, filePath);
      }
    }
  };

  const shouldUseIdList = (option) => {
    return (
      option.toLowerCase().includes("used") ||
      option.toLowerCase().includes("generated")
    );
  };

  const renderTooltip = (content) => (
    <Tooltip id="button-tooltip">{content}</Tooltip>
  );

  const renderOptions = () => {
    if (!selectedCommand || !commands[selectedCommand]) return null;

    const commandOptions = commands[selectedCommand];
    const currentOptions = selectedSubCommand
      ? commandOptions[selectedSubCommand]
      : commandOptions;

    if (!currentOptions || !currentOptions.options) return null;

    return (
      <>
        {(selectedCommand === "1: Init" ||
          selectedCommand === "2: Register") && (
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#ff9800" }}>
              ROCRATE_PATH *
              {helperData["ROCRATE_PATH"] && (
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip(helperData["ROCRATE_PATH"])}
                >
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                  />
                </OverlayTrigger>
              )}
            </Form.Label>
            <div className="input-group">
              <Form.Control
                type="text"
                value={rocratePath}
                onChange={handleRocratePathChange}
                list="previousPaths"
                required
              />
              <datalist id="previousPaths">
                {previousPaths.map((path, index) => (
                  <option key={index} value={path} />
                ))}
              </datalist>
            </div>
          </Form.Group>
        )}
        {currentOptions.options.map((option) => (
          <Form.Group key={option} className="mb-3">
            <Form.Label
              style={{
                color:
                  currentOptions.required &&
                  currentOptions.required.includes(option)
                    ? "#ff9800"
                    : "inherit",
              }}
            >
              {option}{" "}
              {currentOptions.required &&
              currentOptions.required.includes(option)
                ? "*"
                : ""}
              {helperData[option] && (
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip(helperData[option])}
                >
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                  />
                </OverlayTrigger>
              )}
            </Form.Label>
            {option === "file" ||
            option === "source-filepath" ||
            option === "filepath" ? (
              <Form.Control
                type="file"
                onChange={(e) => handleFileChange(option, e.target.files[0])}
                required={
                  currentOptions.required &&
                  currentOptions.required.includes(option)
                }
              />
            ) : option === "destination-filepath" ? (
              <Form.Control
                type="text"
                value={options[option] || ""}
                readOnly
                required={
                  currentOptions.required &&
                  currentOptions.required.includes(option)
                }
              />
            ) : option === "guid" ? (
              <Form.Control
                type="text"
                value={options[option] || "ark:59852/"}
                onChange={(e) => handleOptionChange(option, e.target.value)}
                required={
                  currentOptions.required &&
                  currentOptions.required.includes(option)
                }
              />
            ) : shouldUseIdList(option) ? (
              <Form.Control
                type="text"
                value={options[option] || ""}
                onChange={(e) => handleOptionChange(option, e.target.value)}
                list={`${option}List`}
                required={
                  currentOptions.required &&
                  currentOptions.required.includes(option)
                }
              />
            ) : (
              <Form.Control
                type="text"
                value={options[option] || ""}
                onChange={(e) => handleOptionChange(option, e.target.value)}
                required={
                  currentOptions.required &&
                  currentOptions.required.includes(option)
                }
              />
            )}
            {shouldUseIdList(option) && (
              <datalist id={`${option}List`}>
                {roCrateIds.map((id, index) => (
                  <option key={index} value={id} />
                ))}
              </datalist>
            )}
          </Form.Group>
        ))}
      </>
    );
  };

  const handleFormSubmit = async (e, action) => {
    e.preventDefault();
    let result;
    if (selectedCommand === "4: Upload") {
      result = await handleUpload(e);
    } else {
      result = await handleSubmit(e);
    }

    if (result && result.success) {
      if (selectedCommand === "2: Register" && action === "addAnother") {
        onAddAnother();
      } else {
        onSuccessfulExecution(selectedCommand);
      }
    }
  };

  const renderButtons = () => {
    if (selectedCommand === "2: Register") {
      return (
        <>
          <StyledButton
            type="button"
            disabled={isExecuteDisabled()}
            onClick={(e) => handleFormSubmit(e, "addAnother")}
          >
            Add Another
          </StyledButton>
          <StyledButton
            type="button"
            disabled={isExecuteDisabled()}
            onClick={(e) => handleFormSubmit(e, "finish")}
          >
            Finish Adding
          </StyledButton>
        </>
      );
    } else {
      return (
        <StyledButton
          type="button"
          disabled={isExecuteDisabled()}
          onClick={(e) => handleFormSubmit(e)}
        >
          {selectedCommand === "4: Upload" ? "Upload" : "Execute"}
        </StyledButton>
      );
    }
  };

  return (
    <StyledForm onSubmit={(e) => e.preventDefault()}>
      {renderOptions()}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        {renderButtons()}
      </div>
    </StyledForm>
  );
}

export default CommandForm;
