import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Form, Button, Row, Col } from "react-bootstrap";
import { rocrate_create } from "../rocrate/rocrate";
import { ipcRenderer } from "electron";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";

const StyledForm = styled(Form)`
  background-color: #282828;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h3`
  color: #ffffff;
  margin-bottom: 10px;
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

const StyledSelect = styled(Form.Select)`
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

const StyledButton = styled(Button)`
  background-color: #007bff;
  border: none;
  &:hover {
    background-color: #0056b3;
  }
`;

const BrowseButton = styled(Button)`
  margin-top: 10px;
`;

const PreviewContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 5px;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
`;

const PreviewTitle = styled.h4`
  color: #ffffff;
  margin-bottom: 15px;
  text-align: center;
`;

const organizations = [
  { name: "UVA", guid: "ark:59852/organization-uva" },
  { name: "UCSD", guid: "ark:59852/organization-ucsd" },
  { name: "Stanford", guid: "ark:59852/organization-stanford" },
  { name: "USF", guid: "ark:59852/organization-usf" },
  { name: "UCSF", guid: "ark:59852/organization-ucsf" },
  { name: "Yale", guid: "ark:59852/organization-yale" },
  { name: "SFU", guid: "ark:59852/organization-sfu" },
  { name: "Texas", guid: "ark:59852/organization-texas" },
  { name: "UA", guid: "ark:59852/organization-ua" },
  {
    name: "Université de Montréal",
    guid: "ark:59852/organization-universite-de-montreal",
  },
];

const projects = [
  { name: "CM4AI", guid: "ark:59852/project-cm4ai" },
  { name: "CHORUS", guid: "ark:59852/project-chorus" },
  { name: "PreMo", guid: "ark:59852/project-premo" },
];

function InitForm({ rocratePath, setRocratePath, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    organization_name: "",
    project_name: "",
    description: "",
    keywords: "",
  });

  const [jsonLdPreview, setJsonLdPreview] = useState({});

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
    return `ark:${NAAN}/rocrate-${name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${sq}`;
  };

  const updateJsonLdPreview = () => {
    const guid = generateGuid(formData.name);
    const preview = {
      "@id": guid,
      "@context": {
        "@vocab": "https://schema.org/",
        EVI: "https://w3id.org/EVI#",
      },
      "@type": "https://w3id.org/EVI#ROCrate",
      name: formData.name,
      isPartOf: [],
      keywords: formData.keywords.split(",").map((k) => k.trim()),
      description: formData.description,
      "@graph": [],
    };

    if (formData.organization_name) {
      const organization = organizations.find(
        (org) => org.name === formData.organization_name
      );
      if (organization) {
        preview.isPartOf.push({
          "@id": organization.guid,
          "@type": "Organization",
          name: organization.name,
        });
      }
    }

    if (formData.project_name) {
      const project = projects.find(
        (proj) => proj.name === formData.project_name
      );
      if (project) {
        preview.isPartOf.push({
          "@id": project.guid,
          "@type": "Project",
          name: project.name,
        });
      }
    }

    setJsonLdPreview(preview);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const guid = generateGuid(formData.name);
    try {
      const result = rocrate_create(
        rocratePath,
        formData.name,
        formData.organization_name,
        formData.project_name,
        formData.description,
        formData.keywords,
        guid
      );
      console.log(result);
      onSuccess();
    } catch (error) {
      console.error("Failed to create RO-Crate:", error);
      // Handle the error (e.g., show an error message to the user)
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
      // Handle the error (e.g., show an error message to the user)
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormTitle>Initialize an RO-Crate</FormTitle>
      <Row>
        <Col md={6}>
          <StyledFormGroup className="mb-3">
            <StyledLabel>RO-Crate Path</StyledLabel>
            <StyledInput
              type="text"
              value={rocratePath}
              onChange={(e) => setRocratePath(e.target.value)}
              required
            />
            <BrowseButton variant="secondary" onClick={handleBrowse}>
              Browse
            </BrowseButton>
          </StyledFormGroup>

          <StyledFormGroup className="mb-3">
            <StyledLabel>RO-Crate Name</StyledLabel>
            <StyledInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </StyledFormGroup>

          <StyledFormGroup className="mb-3">
            <StyledLabel>Organization Name</StyledLabel>
            <StyledSelect
              name="organization_name"
              value={formData.organization_name}
              onChange={handleChange}
              required
            >
              <option value="">Select an organization</option>
              {organizations.map((org) => (
                <option key={org.guid} value={org.name}>
                  {org.name}
                </option>
              ))}
            </StyledSelect>
          </StyledFormGroup>

          <StyledFormGroup className="mb-3">
            <StyledLabel>Project Name</StyledLabel>
            <StyledSelect
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.guid} value={project.name}>
                  {project.name}
                </option>
              ))}
            </StyledSelect>
          </StyledFormGroup>

          <StyledFormGroup className="mb-3">
            <StyledLabel>Description</StyledLabel>
            <StyledTextArea
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </StyledFormGroup>

          <StyledFormGroup className="mb-3">
            <StyledLabel>Keywords</StyledLabel>
            <StyledInput
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="Enter keywords separated by commas"
              required
            />
          </StyledFormGroup>

          <StyledButton type="submit">Initialize RO-Crate</StyledButton>
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

export default InitForm;
