import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import path from "path";
import {
  StyledForm,
  StyledFormGroup,
  StyledFormControl,
  StyledButton,
} from "./StyledComponents";

function CommandForm({
  commands,
  selectedCommand,
  selectedSubCommand,
  selectedSubSubCommand,
  options,
  rocratePath,
  schemaFile,
  handleOptionChange,
  handleRocratePathChange,
  handleSchemaFileChange,
  handleSubmit,
  handleUpload,
  isExecuteDisabled,
}) {
  const [sourceFilePath, setSourceFilePath] = useState("");

  useEffect(() => {
    if (sourceFilePath && rocratePath) {
      const filename = path.basename(sourceFilePath);
      const destinationPath = path.join(rocratePath, filename);
      handleOptionChange("destination-filepath", destinationPath);
    }
  }, [sourceFilePath, rocratePath]);

  const handleFileChange = (option, file) => {
    if (file) {
      const filePath = file.path;
      setSourceFilePath(filePath);
      handleOptionChange(option, filePath);
    }
  };

  const renderOptions = () => {
    let currentOptions = commands[selectedCommand];
    if (selectedSubCommand) {
      currentOptions = currentOptions[selectedSubCommand];
    }
    if (selectedSubSubCommand) {
      currentOptions = currentOptions[selectedSubSubCommand];
    }
    if (
      !currentOptions ||
      (!currentOptions.options && !currentOptions.required)
    ) {
      return null;
    }
    const allOptions = currentOptions.options || currentOptions.required;
    return (
      <>
        {selectedCommand === "rocrate" && (
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#ff9800" }}>ROCRATE_PATH *</Form.Label>
            <Form.Control
              type="text"
              value={rocratePath}
              onChange={handleRocratePathChange}
              required
            />
          </Form.Group>
        )}
        {selectedCommand === "schema" && (
          <Form.Group className="mb-3">
            <Form.Label style={{ color: "#ff9800" }}>SCHEMA_FILE *</Form.Label>
            <Form.Control
              type="text"
              value={schemaFile}
              onChange={handleSchemaFileChange}
              required
            />
          </Form.Group>
        )}
        {allOptions.map((option) => (
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
            </Form.Label>
            {option === "file" || option === "source-filepath" ? (
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
          </Form.Group>
        ))}
      </>
    );
  };

  return (
    <StyledForm
      onSubmit={selectedCommand === "upload" ? handleUpload : handleSubmit}
    >
      {renderOptions()}
      <StyledButton type="submit" disabled={isExecuteDisabled()}>
        {selectedCommand === "upload" ? "Upload" : "Execute"}
      </StyledButton>
    </StyledForm>
  );
}

export default CommandForm;
