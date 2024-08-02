import React, { useState } from "react";
import styled from "styled-components";
import { Form, Button } from "react-bootstrap";
import { rocrate_create } from "../rocrate/rocrate";
import { ipcRenderer } from "electron";

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

function InitForm({ rocratePath, setRocratePath, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    organization_name: "",
    project_name: "",
    description: "",
    keywords: "",
  });

  const organizations = ["UVA", "UCSB", "Stanford", "USF"];
  const projects = ["CM4AI", "Chorus", "PreMo"];

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
            <option key={org} value={org}>
              {org}
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
            <option key={project} value={project}>
              {project}
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
    </StyledForm>
  );
}

export default InitForm;
