import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Form, Button, Row, Col } from "react-bootstrap";
import { register_dataset } from "../../rocrate/rocrate";
import path from "path";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";

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
`;

const StyledInput = styled(Form.Control)`
  background-color: #3e3e3e;
  border: 1px solid #555;
  color: #ffffff;
  &:focus {
    background-color: #3e3e3e;
    color: #ffffff;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const StyledTextArea = styled(StyledInput)`
  resize: vertical;
  min-height: 100px;
  width: 100%;
  padding: 10px;
`;

const StyledButton = styled(Button)`
  background-color: #007bff;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
  margin-right: 10px;
`;

const PreviewContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 15px;
  height: 100%;
  overflow-y: auto;
`;

const PreviewTitle = styled.h3`
  color: #ffffff;
  margin-bottom: 15px;
  text-align: center;
`;

function DatasetForm({ file, onBack, rocratePath, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    author: "",
    version: "",
    "date-published": "",
    description: "",
    keywords: "",
    "data-format": "",
    url: "",
    "used-by": [],
    "derived-from": [],
    schema: "",
    "associated-publication": "",
    "additional-documentation": "",
  });

  const [jsonLdPreview, setJsonLdPreview] = useState({});

  useEffect(() => {
    const fileName = path.basename(file, path.extname(file)).replace(/_/g, " ");
    const fileExtension = path.extname(file).slice(1).toUpperCase();

    setFormData((prevState) => ({
      ...prevState,
      name: fileName,
      "data-format": fileExtension,
    }));

    updateJsonLdPreview();
  }, [file]);

  useEffect(() => {
    updateJsonLdPreview();
  }, [formData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateGuid = (name) => {
    const NAAN = "59852";
    const sq = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "")
      .slice(0, 14);
    return `ark:${NAAN}/dataset-${name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${sq}`;
  };

  const updateJsonLdPreview = () => {
    const guid = generateGuid(formData.name);
    const preview = {
      "@context": {
        "@vocab": "https://schema.org/",
        EVI: "https://w3id.org/EVI#",
      },
      "@id": guid,
      "@type": "https://w3id.org/EVI#Dataset",
      name: formData.name,
      author: formData.author,
      version: formData.version,
      datePublished: formData["date-published"],
      description: formData.description,
      keywords: formData.keywords.split(",").map((k) => k.trim()),
      format: formData["data-format"],
      url: formData.url || undefined,
      usedBy: formData["used-by"] || undefined,
      derivedFrom: formData["derived-from"] || undefined,
      schema: formData.schema || undefined,
      associatedPublication: formData["associated-publication"] || undefined,
      additionalDocumentation:
        formData["additional-documentation"] || undefined,
    };
    setJsonLdPreview(preview);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const guid = generateGuid(formData.name);
    const fullFilePath = path.join(rocratePath, file);
    const result = register_dataset(
      rocratePath,
      formData.name,
      formData.author,
      formData.version,
      formData["date-published"],
      formData.description,
      formData.keywords,
      formData["data-format"],
      fullFilePath,
      guid,
      formData.url,
      formData["used-by"],
      formData["derived-from"],
      formData.schema,
      formData["associated-publication"],
      formData["additional-documentation"]
    );
    console.log(result);
    onSuccess();
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormTitle>Register Dataset: {file}</FormTitle>
      <Row>
        <Col md={6}>
          <StyledFormGroup>
            <StyledLabel>Dataset Name *</StyledLabel>
            <StyledInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <StyledLabel>Author *</StyledLabel>
            <StyledInput
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="1st Author First Last, 2nd Author First Last, ..."
              required
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <StyledLabel>Version *</StyledLabel>
            <StyledInput
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              placeholder="Examples: 1.0.1, 1.0"
              required
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <StyledLabel>Date Published *</StyledLabel>
            <StyledInput
              type="date"
              name="date-published"
              value={formData["date-published"]}
              onChange={handleChange}
              required
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <StyledLabel>Description *</StyledLabel>
            <StyledTextArea
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <StyledLabel>Keywords *</StyledLabel>
            <StyledInput
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="genetics, vital signs, heart rate"
              required
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <StyledLabel>Data Format *</StyledLabel>
            <StyledInput
              type="text"
              name="data-format"
              value={formData["data-format"]}
              onChange={handleChange}
              required
            />
          </StyledFormGroup>

          {/* Add other non-required fields here */}

          <StyledButton type="submit">Register Dataset</StyledButton>
          <StyledButton onClick={onBack} variant="secondary">
            Back
          </StyledButton>
        </Col>
        <Col md={6}>
          <PreviewContainer>
            <PreviewTitle>Preview metadata in JSON-LD </PreviewTitle>
            <SyntaxHighlighter
              language="json"
              style={vs2015}
              customStyle={{
                backgroundColor: "transparent",
                padding: "0",
                margin: "0",
                fontSize: "0.9em",
              }}
            >
              {JSON.stringify(jsonLdPreview, null, 2)}
            </SyntaxHighlighter>
          </PreviewContainer>
        </Col>
      </Row>
    </StyledForm>
  );
}

export default DatasetForm;
