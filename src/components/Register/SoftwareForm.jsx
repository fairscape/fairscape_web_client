import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Form, Button } from "react-bootstrap";
import { register_software } from "../../rocrate/rocrate";
import path from "path";

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

function SoftwareForm({ file, onBack, rocratePath, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    author: "",
    version: "",
    description: "",
    keywords: "",
    "file-format": "",
    url: "",
    "date-modified": "",
    "used-by-computation": "",
    "associated-publication": "",
    "additional-documentation": "",
  });

  useEffect(() => {
    // Extract the file name without extension and replace underscores with spaces
    const fileName = path.basename(file, path.extname(file)).replace(/_/g, " ");
    // Get the file extension (without the dot) and convert to uppercase
    const fileExtension = path.extname(file).slice(1).toUpperCase();

    setFormData((prevState) => ({
      ...prevState,
      name: fileName,
      "file-format": fileExtension,
    }));
  }, [file]);

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
    return `ark:${NAAN}/software-${name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${sq}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const guid = generateGuid(formData.name);
    const fullFilePath = path.join(rocratePath, file);
    try {
      const result = register_software(
        rocratePath,
        formData.name,
        formData.author,
        formData.version,
        formData.description,
        formData.keywords,
        formData["file-format"],
        guid,
        formData.url,
        formData["date-modified"],
        fullFilePath,
        formData["used-by-computation"],
        formData["associated-publication"],
        formData["additional-documentation"]
      );
      console.log(result);
      onSuccess();
      // Handle success (e.g., show success message, navigate back to file selector)
    } catch (error) {
      console.error("Error registering software:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormTitle>Register Software: {file}</FormTitle>

      <StyledFormGroup>
        <StyledLabel>Name *</StyledLabel>
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
          required
        />
      </StyledFormGroup>

      <StyledFormGroup>
        <StyledLabel>File Format *</StyledLabel>
        <StyledInput
          type="text"
          name="file-format"
          value={formData["file-format"]}
          onChange={handleChange}
          required
        />
      </StyledFormGroup>

      <StyledFormGroup>
        <StyledLabel>URL</StyledLabel>
        <StyledInput
          type="text"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="http://github/link-to-repo"
        />
      </StyledFormGroup>

      <StyledFormGroup>
        <StyledLabel>Associated Publication</StyledLabel>
        <StyledInput
          type="text"
          name="associated-publication"
          value={formData["associated-publication"]}
          onChange={handleChange}
        />
      </StyledFormGroup>

      <StyledButton type="submit">Register Software</StyledButton>
      <StyledButton onClick={onBack} variant="secondary">
        Back
      </StyledButton>
    </StyledForm>
  );
}

export default SoftwareForm;
