import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import styled from "styled-components";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { register_schema } from "../../rocrate/rocrate";

const StyledForm = styled(Form)`
  background-color: #282828;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: #ffffff;
`;

const FormTitle = styled.h2`
  margin-bottom: 30px;
  text-align: center;
  color: #ffffff;
`;

const StyledFormGroup = styled(Form.Group)`
  margin-bottom: 20px;
`;

const StyledLabel = styled(Form.Label)`
  font-weight: bold;
  color: #ffffff;
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

const PropertySection = styled(Card)`
  background-color: #3e3e3e;
  border: 1px solid #555;
  margin-bottom: 20px;
  padding: 20px;
  color: #ffffff;
`;

const PropertyList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 20px;
`;

const PropertyItem = styled.div`
  background-color: #4e4e4e;
  border: 1px solid #666;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  color: #ffffff;
`;

const PreviewContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 15px;
  height: 100%;
  overflow-y: auto;
`;

const PreviewTitle = styled.h3`
  margin-bottom: 15px;
  text-align: center;
  color: #ffffff;
`;

const WhiteText = styled.h4`
  color: #ffffff;
`;

const SchemaForm = ({ datasetName, onSubmit, onCancel, rocratePath }) => {
  const [schemaData, setSchemaData] = useState({
    name: "",
    description: "",
    properties: [],
    separator: ",",
    header: false,
  });

  const [newProperty, setNewProperty] = useState({
    name: "",
    description: "",
    index: "",
    valueURL: "",
    type: "string",
  });

  const [jsonLdPreview, setJsonLdPreview] = useState({});

  useEffect(() => {
    updateJsonLdPreview();
  }, [schemaData]);

  const handleSchemaChange = (e) => {
    const { name, value } = e.target;
    setSchemaData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    setNewProperty((prev) => ({ ...prev, [name]: value }));
  };

  const addProperty = () => {
    if (newProperty.name && newProperty.description && newProperty.index) {
      setSchemaData((prev) => ({
        ...prev,
        properties: [...prev.properties, newProperty],
      }));
      setNewProperty({
        name: "",
        description: "",
        index: "",
        valueURL: "",
        type: "string",
      });
    } else {
      alert(
        "Please fill in all required fields (Name, Description, and Index) before adding a property."
      );
    }
  };

  const removeProperty = (index) => {
    setSchemaData((prev) => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index),
    }));
  };

  const updateJsonLdPreview = () => {
    const preview = {
      "@id": `ark:59852/schema-${schemaData.name}-${new Date().getTime()}`,
      "@context": {
        "@vocab": "https://schema.org/",
        EVI: "https://w3id.org/EVI#",
      },
      "@type": "EVI:Schema",
      schema: "https://json-schema.org/draft/2020-12/schema",
      name: schemaData.name,
      description: schemaData.description,
      properties: schemaData.properties.reduce((acc, prop) => {
        acc[prop.name] = {
          description: prop.description,
          index: prop.index,
          valueURL: prop.valueURL || null,
          type: prop.type,
        };
        return acc;
      }, {}),
      type: "object",
      additionalProperties: true,
      required: schemaData.properties.map((prop) => prop.name),
      separator: schemaData.separator,
      header: schemaData.header,
      examples: [],
    };
    setJsonLdPreview(preview);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const guid = `ark:59852/schema-${schemaData.name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${new Date().getTime()}`;

    try {
      const result = register_schema(
        rocratePath,
        schemaData.name,
        schemaData.description,
        schemaData.properties.reduce((acc, prop) => {
          acc[prop.name] = {
            description: prop.description,
            index: prop.index,
            valueURL: prop.valueURL || null,
            type: prop.type,
          };
          return acc;
        }, {}),
        schemaData.properties.map((prop) => prop.name), // required fields
        schemaData.separator,
        schemaData.header,
        guid,
        null, // url
        true, // additionalProperties
        [] // examples
      );
      console.log("Schema registration result:", result);
      onSubmit(jsonLdPreview); // Call the onSubmit prop with the registered schema data
    } catch (error) {
      console.error("Error registering schema:", error);
      alert(`Error registering schema: ${error.message}`);
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <FormTitle>Register Schema for Dataset: {datasetName}</FormTitle>
      <Row>
        <Col md={6}>
          <StyledFormGroup>
            <StyledLabel>Schema Name *</StyledLabel>
            <StyledInput
              type="text"
              name="name"
              value={schemaData.name}
              onChange={handleSchemaChange}
              required
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <StyledLabel>Description *</StyledLabel>
            <StyledTextArea
              as="textarea"
              rows={3}
              name="description"
              value={schemaData.description}
              onChange={handleSchemaChange}
              required
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <StyledLabel>Separator</StyledLabel>
            <StyledInput
              type="text"
              name="separator"
              value={schemaData.separator}
              onChange={handleSchemaChange}
            />
          </StyledFormGroup>

          <StyledFormGroup>
            <Form.Check
              type="checkbox"
              label="Header"
              name="header"
              checked={schemaData.header}
              onChange={(e) =>
                setSchemaData((prev) => ({ ...prev, header: e.target.checked }))
              }
            />
          </StyledFormGroup>

          <PropertySection>
            <WhiteText>Properties</WhiteText>
            <StyledFormGroup>
              <StyledLabel>Property Name *</StyledLabel>
              <StyledInput
                type="text"
                name="name"
                value={newProperty.name}
                onChange={handlePropertyChange}
              />
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Description *</StyledLabel>
              <StyledInput
                type="text"
                name="description"
                value={newProperty.description}
                onChange={handlePropertyChange}
              />
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Index *</StyledLabel>
              <StyledInput
                type="text"
                name="index"
                value={newProperty.index}
                onChange={handlePropertyChange}
              />
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Value URL</StyledLabel>
              <StyledInput
                type="text"
                name="valueURL"
                value={newProperty.valueURL}
                onChange={handlePropertyChange}
              />
            </StyledFormGroup>

            <StyledFormGroup>
              <StyledLabel>Type *</StyledLabel>
              <Form.Control
                as="select"
                name="type"
                value={newProperty.type}
                onChange={handlePropertyChange}
                style={{ backgroundColor: "#3e3e3e", color: "#ffffff" }}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="integer">Integer</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
              </Form.Control>
            </StyledFormGroup>

            <StyledButton type="button" onClick={addProperty}>
              Add Property
            </StyledButton>

            <PropertyList>
              {schemaData.properties.map((prop, index) => (
                <PropertyItem key={index}>
                  <h5 style={{ color: "#ffffff" }}>{prop.name}</h5>
                  <p>Description: {prop.description}</p>
                  <p>Index: {prop.index}</p>
                  <p>Type: {prop.type}</p>
                  {prop.valueURL && <p>Value URL: {prop.valueURL}</p>}
                  <StyledButton
                    variant="danger"
                    onClick={() => removeProperty(index)}
                  >
                    Remove
                  </StyledButton>
                </PropertyItem>
              ))}
            </PropertyList>
          </PropertySection>

          <StyledButton type="submit">Register Schema</StyledButton>
          <StyledButton onClick={onCancel} variant="secondary">
            Skip Schema
          </StyledButton>
        </Col>
        <Col md={6}>
          <PreviewContainer>
            <PreviewTitle>Preview Schema in JSON-LD</PreviewTitle>
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
};

export default SchemaForm;
