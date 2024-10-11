import React, { useState, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import { register_schema } from "../../rocrate/rocrate";
import { ipcRenderer } from "electron";
import {
  StyledForm,
  FormTitle,
  StyledButton,
  FormField,
  TextAreaField,
  JsonLdPreview,
  StyledFormGroup,
  StyledLabel,
  StyledInput,
  PropertySection,
  PropertyList,
  PropertyItem,
  WhiteText,
} from "./SharedComponents";

const SchemaForm = ({
  datasetName,
  onSubmit,
  onCancel,
  rocratePath,
  filePath,
}) => {
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

  useEffect(() => {
    if (filePath && filePath.toLowerCase().endsWith(".parquet")) {
      convertParquetSchema(filePath);
    }
  }, [filePath]);

  const convertParquetSchema = async (parquetFilePath) => {
    try {
      const schemaJSON = await ipcRenderer.invoke(
        "convert-parquet-to-schema",
        rocratePath,
        parquetFilePath
      );
      setSchemaData((prevData) => ({
        ...prevData,
        name: schemaJSON.name,
        description: schemaJSON.description,
        properties: schemaJSON.properties,
        separator: schemaJSON.separator,
        header: schemaJSON.header,
      }));
    } catch (error) {
      console.error("Error converting Parquet schema:", error);
      alert(
        "Error converting Parquet schema. Please check the file and try again."
      );
    }
  };

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
        schemaData.properties.map((prop) => prop.name),
        schemaData.separator,
        schemaData.header,
        guid,
        null,
        true,
        []
      );
      console.log("Schema registration result:", result);
      onSubmit(jsonLdPreview);
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
          <FormField
            label="Schema Name"
            name="name"
            value={schemaData.name}
            onChange={handleSchemaChange}
            required
          />

          <TextAreaField
            label="Description"
            name="description"
            value={schemaData.description}
            onChange={handleSchemaChange}
            required
          />

          <FormField
            label="Separator"
            name="separator"
            value={schemaData.separator}
            onChange={handleSchemaChange}
          />

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
            <FormField
              label="Property Name"
              name="name"
              value={newProperty.name}
              onChange={handlePropertyChange}
            />

            <FormField
              label="Description"
              name="description"
              value={newProperty.description}
              onChange={handlePropertyChange}
            />

            <FormField
              label="Index"
              name="index"
              value={newProperty.index}
              onChange={handlePropertyChange}
            />

            <FormField
              label="Value URL"
              name="valueURL"
              value={newProperty.valueURL}
              onChange={handlePropertyChange}
            />

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
          <JsonLdPreview jsonLdData={jsonLdPreview} />
        </Col>
      </Row>
    </StyledForm>
  );
};

export default SchemaForm;
