import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Form } from "react-bootstrap";
// Removed DropResult and react-beautiful-dnd imports
import entitySchemas from "./config/entitySchemas.json";
import {
  FormSection,
  FormSectionTitle,
  StyledButton,
  JsonLdPreview,
  ButtonContainer,
  FormField,
  TextAreaField,
  SelectionGroupContainer, // Added
  SelectionGroupTitle, // Added
  SelectionList, // Added
  SelectionItemLabel, // Added
  SelectionItemDetails, // Added
} from "./SharedComponents";
import KeywordsField from "./KeywordsField";
// Removed DraggableSection and its types

// Interface for available entities remains useful
interface AvailableEntity {
  "@id": string;
  name?: string;
  "@type"?: string | string[];
}

// Interface for the relationship config from schema
interface RelationshipTargetConfig {
  id: string; // e.g., "usedDataset", "usedSoftware", "generated"
  label: string;
  accepts: string[]; // e.g., ["Dataset", "Software"]
}
interface RelationshipConfig {
  sources: string[]; // Still useful for identifying potential entity types
  targets: RelationshipTargetConfig[];
}

interface SchemaProperty {
  name: string;
  label: string;
  type: string; // "text", "textarea", "keywords", "relationships", etc.
  required: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  config?: RelationshipConfig | unknown; // Config for relationships
}

interface EntitySchema {
  properties: SchemaProperty[];
}

// State to hold selected relationship IDs, keyed by target ID (e.g., "usedDataset")
interface SelectedRelationships {
  [key: string]: string[]; // e.g., { usedDataset: ["id1", "id2"], usedSoftware: ["id3"] }
}

interface DynamicEntityFormProps {
  entityType: keyof typeof entitySchemas;
  availableEntities: AvailableEntity[]; // Renamed for clarity
  onAdd: (entityData: Record<string, any>) => void;
  onCancel: () => void;
}

const DynamicEntityForm: React.FC<DynamicEntityFormProps> = ({
  entityType,
  availableEntities,
  onAdd,
  onCancel,
}) => {
  const schema: EntitySchema | undefined = entitySchemas[entityType];

  if (!schema) {
    return <div>Error: Schema not found for type {entityType}</div>;
  }

  const getRelationshipConfig = useCallback((): RelationshipConfig | null => {
    const relProp = schema.properties.find((p) => p.type === "relationships"); // Changed type name
    return relProp?.config as RelationshipConfig | null;
  }, [schema]);

  const initializeFormData = useCallback(() => {
    return schema.properties.reduce((acc, prop) => {
      if (prop.type !== "relationships") {
        acc[prop.name] =
          prop.defaultValue !== undefined ? prop.defaultValue : "";
      }
      return acc;
    }, {} as Record<string, any>);
  }, [schema]);

  // Initialize state for selected relationships based on config
  const initializeSelectedRelationships =
    useCallback((): SelectedRelationships => {
      const config = getRelationshipConfig();
      if (!config) return {};
      return config.targets.reduce((acc, target) => {
        acc[target.id] = [];
        return acc;
      }, {} as SelectedRelationships);
    }, [getRelationshipConfig]);

  const [formData, setFormData] =
    useState<Record<string, any>>(initializeFormData);
  const [selectedRelationships, setSelectedRelationships] =
    useState<SelectedRelationships>(initializeSelectedRelationships);
  const [jsonLdPreview, setJsonLdPreview] = useState<Record<string, any>>({});

  // Helper to get base type (Dataset, Software)
  const getBaseType = (
    typeInfo: string | string[] | undefined
  ): string | null => {
    if (!typeInfo) return null;
    const typeString = Array.isArray(typeInfo)
      ? typeInfo.find((t) => t.includes("#") || t.includes("/")) || typeInfo[0]
      : typeInfo;
    // Use '#' as primary separator, fallback to '/'
    return typeString?.split("#").pop()?.split("/").pop() || typeString || null;
  };

  // Update JSON-LD Preview
  useEffect(() => {
    const NAAN = "59852"; // Consider making this configurable
    const safeName = (formData.name || `temp-${entityType}`)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .substring(0, 30);
    // Ensure GUID generation is consistent or handled server-side/on save
    const guid = `ark:/${NAAN}/${entityType.toLowerCase()}-${safeName}-${Date.now()}`;

    const preview: Record<string, any> = {
      "@id": guid,
      "@type": `https://w3id.org/EVI#${entityType}`, // Use full EVI URL
    };

    schema.properties.forEach((prop) => {
      const value = formData[prop.name];

      if (
        prop.type === "relationships" ||
        value === undefined ||
        value === ""
      ) {
        return;
      }

      // Map form fields to JSON-LD properties (same logic as before)
      switch (prop.name) {
        case "filename":
          preview.contentUrl = `file:///${value}`;
          break;
        case "fileFormat":
        case "dataFormat":
          preview.encodingFormat = value;
          break;
        case "keywords":
          preview.keywords =
            typeof value === "string"
              ? value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean)
              : [];
          if (preview.keywords.length === 0) delete preview.keywords;
          break;
        case "author":
        case "runBy":
          // Ensure value is treated as string before creating object
          if (typeof value === "string" && value.trim()) {
            preview[prop.name] = { name: value };
          }
          break;
        case "schema":
          if (typeof value === "string" && value.trim()) {
            preview.schema = { "@id": value };
          }
          break;
        case "associatedPublication":
        case "additionalDocumentation":
        case "url":
          if (
            typeof value === "string" &&
            (value.startsWith("http") || value.startsWith("ark:"))
          ) {
            preview[prop.name] = { "@id": value };
          } else if (value) {
            preview[prop.name] = value;
          }
          break;
        default:
          preview[prop.name] = value;
      }
    });

    // Add relationships from selectedRelationships state
    Object.entries(selectedRelationships).forEach(([key, ids]) => {
      if (ids && ids.length > 0) {
        preview[key] = ids.map((id) => ({ "@id": id }));
      }
    });

    // Clean undefined properties
    Object.keys(preview).forEach(
      (key) =>
        (preview[key] === undefined ||
          (Array.isArray(preview[key]) && preview[key].length === 0)) &&
        delete preview[key]
    );

    setJsonLdPreview(preview);
  }, [formData, selectedRelationships, entityType, schema]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for checkbox changes in relationship selections
  const handleRelationshipSelection = (
    targetId: string, // e.g., "usedDataset"
    entityId: string, // The ID of the entity being selected/deselected
    checked: boolean
  ) => {
    setSelectedRelationships((prev) => {
      const currentSelection = prev[targetId] || [];
      let newSelection;
      if (checked) {
        // Add if not already present
        newSelection = currentSelection.includes(entityId)
          ? currentSelection
          : [...currentSelection, entityId];
      } else {
        // Remove
        newSelection = currentSelection.filter((id) => id !== entityId);
      }
      return { ...prev, [targetId]: newSelection };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    for (const prop of schema.properties) {
      if (
        prop.required &&
        prop.type !== "relationships" && // Don't require relationships
        !formData[prop.name]
      ) {
        alert(`Please fill in the required field: ${prop.label}`);
        return;
      }
    }

    // Prepare data to be passed up
    const entityData: Record<string, any> = {
      ...formData, // Include standard form fields
      entityType: entityType, // Keep track of the type
      ...selectedRelationships, // Directly include the selected relationship IDs { usedDataset: [...], usedSoftware: [...] }
    };

    onAdd(entityData); // Call parent's add handler

    // Reset form and selections
    setFormData(initializeFormData());
    setSelectedRelationships(initializeSelectedRelationships());
  };

  // Render selection groups for relationships
  const renderRelationshipSelector = (prop: SchemaProperty) => {
    if (prop.type !== "relationships" || !prop.config) return null;

    const config = prop.config as RelationshipConfig;

    return (
      <div key={prop.name} style={{ marginTop: "20px", marginBottom: "20px" }}>
        <h4
          style={{
            marginBottom: "15px",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          {prop.label || "Relationships"}
        </h4>
        <Row>
          {config.targets.map((target) => {
            // Filter available entities based on the 'accepts' criteria for this target
            const relevantEntities = availableEntities.filter((entity) => {
              const baseType = getBaseType(entity["@type"]);
              return baseType && target.accepts.includes(baseType);
            });

            return (
              <Col md={4} key={target.id}>
                <SelectionGroupContainer>
                  <SelectionGroupTitle>{target.label}</SelectionGroupTitle>
                  <SelectionList>
                    {relevantEntities.length > 0 ? (
                      relevantEntities.map((entity) => (
                        <Form.Check
                          type="checkbox"
                          key={entity["@id"]}
                          id={`check-${target.id}-${entity["@id"]}`}
                          checked={(
                            selectedRelationships[target.id] || []
                          ).includes(entity["@id"])}
                          onChange={(e) =>
                            handleRelationshipSelection(
                              target.id,
                              entity["@id"],
                              e.target.checked
                            )
                          }
                        >
                          {/* Nested structure for custom layout */}
                          <Form.Check.Input type="checkbox" />
                          <SelectionItemLabel>
                            {entity.name || "(Unnamed)"}
                            <SelectionItemDetails>
                              ID: {entity["@id"].substring(0, 15)}... | Type:{" "}
                              {getBaseType(entity["@type"])}
                            </SelectionItemDetails>
                          </SelectionItemLabel>
                        </Form.Check>
                      ))
                    ) : (
                      <p
                        style={{
                          color: "#6c757d",
                          fontSize: "0.9rem",
                          textAlign: "center",
                          padding: "10px 0",
                        }}
                      >
                        No available {target.accepts.join(" or ")} entities.
                      </p>
                    )}
                  </SelectionList>
                </SelectionGroupContainer>
              </Col>
            );
          })}
        </Row>
      </div>
    );
  };

  // Render standard form fields
  const renderFormField = (prop: SchemaProperty) => {
    // Skip relationship type here, it's handled separately
    if (prop.type === "relationships") return null;

    const name = prop.name;
    const commonProps = {
      key: name,
      label: prop.label,
      name: name,
      onChange: handleChange,
      required: prop.required,
      placeholder: prop.placeholder || "",
      value: formData[name]?.toString() || "", // Ensure value is string for controlled components
    };

    switch (prop.type) {
      case "text":
      case "date":
      case "url":
        return <FormField {...commonProps} type={prop.type} />;
      case "textarea":
        return (
          <TextAreaField
            {...commonProps}
            rows={prop.name === "command" ? 4 : 2} // Example specific row count
          />
        );
      case "keywords":
        // Use KeywordsField or a simple FormField if KeywordsField is not defined
        return typeof KeywordsField !== "undefined" ? (
          <KeywordsField {...commonProps} />
        ) : (
          <FormField {...commonProps} type="text" />
        );
      // Removed draggableRelationships case
      default:
        console.warn("Unsupported field type in schema:", prop.type);
        // Default to text input for unknown types
        return <FormField {...commonProps} type="text" />;
    }
  };

  const relationshipProp = schema.properties.find(
    (p) => p.type === "relationships"
  );

  return (
    <FormSection as={Form} onSubmit={handleSubmit}>
      <FormSectionTitle>Add New {entityType}</FormSectionTitle>
      <Row>
        {/* Render standard fields first */}
        <Col md={relationshipProp ? 12 : 8}>
          {schema.properties
            .filter((p) => p.type !== "relationships") // Exclude relationship pseudo-field
            .map(renderFormField)}
        </Col>
        {/* Show JSON Preview side-by-side if no relationships */}
        {!relationshipProp && (
          <Col md={4}>
            <JsonLdPreview jsonLdData={jsonLdPreview} />
          </Col>
        )}
      </Row>

      {/* Render relationship selector section if configured */}
      {relationshipProp && renderRelationshipSelector(relationshipProp)}

      <ButtonContainer>
        <StyledButton type="submit">Add {entityType}</StyledButton>
        <StyledButton variant="secondary" onClick={onCancel}>
          Cancel
        </StyledButton>
      </ButtonContainer>

      {/* Show JSON Preview below the form if relationships are present */}
      {relationshipProp && (
        <Row className="mt-4">
          <Col>
            <JsonLdPreview jsonLdData={jsonLdPreview} />
          </Col>
        </Row>
      )}
    </FormSection>
  );
};

export default DynamicEntityForm;
