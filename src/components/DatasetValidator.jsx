import React, { useState } from "react";
import styled from "styled-components";
import { Button, Alert, Spinner } from "react-bootstrap";

const MAX_DISPLAYED_ERRORS = 3;

const ValidatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ValidationAlert = styled(Alert)`
  margin: 0;
  padding: 0.5rem;
  font-size: 0.875rem;
`;

const ValidationButton = styled(Button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #007bff;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorList = styled.div`
  margin-top: 0.5rem;
`;

const ErrorItem = styled.div`
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const ErrorDetail = styled.div`
  margin-left: 1rem;
  font-size: 0.75rem;
  color: #dc3545;
`;

const DownloadLink = styled.a`
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;

  &:hover {
    color: #0056b3;
  }
`;

const RemainingErrors = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.5rem;
  font-style: italic;
`;

const DatasetValidator = ({ datasetId, schemaId, fileName, onValidate }) => {
  const [validating, setValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [error, setError] = useState(null);

  const handleValidate = async () => {
    setValidating(true);
    setError(null);
    setValidationResults(null);
    try {
      const results = await onValidate(datasetId, schemaId);
      setValidationResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const downloadErrorReport = () => {
    if (!validationResults) return;

    const errorReport = validationResults
      .map((error) => {
        const parts = [];
        if (error.path) parts.push(`Path: ${error.path}`);
        if (error.row !== undefined) parts.push(`Row: ${error.row}`);
        if (error.field) parts.push(`Field: ${error.field}`);
        parts.push(`Error: ${error.message}`);
        return parts.join(" | ");
      })
      .join("\n");

    const blob = new Blob([errorReport], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `validation-errors-${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ValidatorContainer>
      <ValidationButton onClick={handleValidate} disabled={validating}>
        {validating ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span>Validating...</span>
          </>
        ) : (
          "Validate Dataset"
        )}
      </ValidationButton>

      {error && (
        <ValidationAlert variant="danger">
          <strong>Validation Error:</strong> {error}
        </ValidationAlert>
      )}

      {validationResults && (
        <ValidationAlert
          variant={validationResults.length === 0 ? "success" : "danger"}
        >
          {validationResults.length === 0 ? (
            <>
              <strong>Validation Successful</strong>
              <div>{fileName} matches its schema</div>
            </>
          ) : (
            <>
              <strong>Validation Failed</strong>
              <ErrorList>
                {validationResults
                  .slice(0, MAX_DISPLAYED_ERRORS)
                  .map((error, index) => (
                    <ErrorItem key={index}>
                      {error.path && <span>Path: {error.path}</span>}
                      {error.row !== undefined && (
                        <span> Row: {error.row}</span>
                      )}
                      {error.field && <span> Field: {error.field}</span>}
                      <ErrorDetail>{error.message}</ErrorDetail>
                    </ErrorItem>
                  ))}
              </ErrorList>
              {validationResults.length > MAX_DISPLAYED_ERRORS && (
                <>
                  <RemainingErrors>
                    ... and {validationResults.length - MAX_DISPLAYED_ERRORS}{" "}
                    more errors
                  </RemainingErrors>
                  <DownloadLink onClick={downloadErrorReport}>
                    Download complete error report
                  </DownloadLink>
                </>
              )}
            </>
          )}
        </ValidationAlert>
      )}
    </ValidatorContainer>
  );
};

export default DatasetValidator;
