import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { Row, Col } from "react-bootstrap";
import { FiDownload, FiPlus } from "react-icons/fi";
import CrateMetadataForm from "../components/Forms/CrateMetadataForm";
import DynamicEntityForm from "../components/Forms/DynamicEntityForm";
import entitySchemas from "../components/Forms/config/entitySchemas.json";
import {
  StyledButton,
  EntityTable,
  ButtonContainer,
  PageTitle,
  FormSectionTitle,
  EntityTableContainer,
  Card,
} from "../components/Forms/SharedComponents";
// Removed DraggableItem, DraggableConfig imports if they were here

// Interface for available entities passed to the form
interface AvailableEntity {
  "@id": string;
  name?: string;
  "@type"?: string | string[];
}

// Define main RO-Crate entity structure
interface ROCrateEntity {
  "@id": string;
  "@type": string | string[];
  name?: string;
  [key: string]: unknown; // Allow other properties
}

// Define the overall RO-Crate metadata structure
interface ROCrateMetadata {
  "@context": Record<string, unknown> | string;
  "@graph": ROCrateEntity[];
}

// Styled container for the page
const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing?.xl || "2rem"};
  max-width: 1600px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors?.background || "#f8f9fa"};
`;

// Styled container specifically for adding entities section
const AddEntitiesSection = styled(Card)`
  // Use Card from SharedComponents
  padding: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  background-color: #ffffff;
  border-radius: ${({ theme }) => theme.borderRadius || "8px"};
  margin-top: ${({ theme }) => theme.spacing?.lg || "1.5rem"};
  border: 1px solid ${({ theme }) => theme.colors?.borderLight || "#dee2e6"};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CreateRocratePage = () => {
  const NAAN = "59852"; // Consider making this configurable
  const [step, setStep] = useState<number>(1);
  const [rocrateMetadata, setRocrateMetadata] = useState<ROCrateMetadata>({
    "@context": "https://w3id.org/ro/crate/1.1/context",
    "@graph": [
      {
        "@id": "ro-crate-metadata.json",
        "@type": "CreativeWork",
        conformsTo: { "@id": "https://w3id.org/ro/crate/1.1" },
        about: { "@id": "./" },
      },
      {
        "@id": "./",
        "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"], // Added EVI type
        hasPart: [],
      },
    ],
  });

  const [currentEntityType, setCurrentEntityType] = useState<
    keyof typeof entitySchemas | null
  >(null);

  // handleSaveCrateMetadata remains the same as provided in the prompt
  const handleSaveCrateMetadata = (data: Record<string, unknown>) => {
    setRocrateMetadata((prev) => {
      const graph = prev["@graph"].map((item) => {
        if (item["@id"] === "./") {
          // Type assertion for clarity
          const metaData = data as {
            name: string;
            description: string;
            keywords: string; // Comma-separated from form
            license: string;
            author: string;
            version: string;
            organizationName: string;
            projectName: string;
            datePublished?: string;
            associatedPublication?: string;
            conditionsOfAccess?: string;
            copyrightNotice?: string;
          };
          const updatedRoot: ROCrateEntity = {
            ...item,
            name: metaData.name,
            description: metaData.description,
            keywords: metaData.keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean),
            license: metaData.license ? { "@id": metaData.license } : undefined,
            author: metaData.author ? { name: metaData.author } : undefined, // Assuming simple name for now
            version: metaData.version || undefined,
            publisher: metaData.organizationName
              ? { "@type": "Organization", name: metaData.organizationName }
              : undefined,
            isPartOf: metaData.projectName
              ? [{ "@type": "CreativeWork", name: metaData.projectName }]
              : [], // Simplified representation
            datePublished: metaData.datePublished || undefined,
            // Handle potential links
            associatedPublication: metaData.associatedPublication
              ? { "@id": metaData.associatedPublication } // Assume it's an ID/URL
              : undefined,
            conditionsOfAccess: metaData.conditionsOfAccess || undefined,
            copyrightHolder: metaData.copyrightNotice
              ? { name: metaData.copyrightNotice } // Assuming simple name for copyright
              : undefined,
          };
          // Clean up undefined optional properties
          Object.keys(updatedRoot).forEach(
            (key) =>
              (updatedRoot as any)[key] === undefined &&
              delete (updatedRoot as any)[key]
          );
          // Clean up empty arrays specifically
          if ((updatedRoot.keywords as string[])?.length === 0)
            delete updatedRoot.keywords;
          if ((updatedRoot.isPartOf as object[])?.length === 0)
            delete updatedRoot.isPartOf;

          return updatedRoot;
        }
        return item;
      });
      return { ...prev, "@graph": graph };
    });
    setStep(2); // Move to the next step
  };

  // ***** UPDATED handleAddEntity *****
  const handleAddEntity = (entityData: Record<string, any>) => {
    setRocrateMetadata((prev) => {
      const newGraph = [...prev["@graph"]];
      const rootDatasetIndex = newGraph.findIndex(
        (item) => item["@id"] === "./"
      );

      const timestamp = Date.now(); // For unique ID generation
      const entityType = entityData.entityType as keyof typeof entitySchemas;

      if (!entityType || !entitySchemas[entityType]) {
        console.error("Invalid entity type provided:", entityType);
        return prev; // Return previous state if type is invalid
      }

      const schema = entitySchemas[entityType];
      // Generate safe name and GUID
      const safeName = ((entityData.name as string) || `entity-${timestamp}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .substring(0, 30);
      const guid = `ark:/${NAAN}/${entityType.toLowerCase()}-${safeName}-${timestamp}`; // Generate ID

      const newEntity: ROCrateEntity = {
        "@id": guid,
        "@type": `https://w3id.org/EVI#${entityType}`, // Use full type URL
      };

      // --- Process standard properties from schema ---
      schema.properties.forEach((prop) => {
        // Skip the pseudo 'relationships' field and entityType itself
        if (prop.type === "relationships" || prop.name === "entityType") {
          return;
        }

        const value = entityData[prop.name];

        // Skip empty/undefined values unless it's explicitly allowed/handled
        if (value === undefined || value === "") {
          return;
        }

        // Map form field names to RO-Crate properties
        switch (prop.name) {
          case "filename":
            newEntity.contentUrl = `file:///${value}`; // Assuming relative path from crate root
            break;
          case "fileFormat": // Software
          case "dataFormat": // Dataset
            newEntity.encodingFormat = value as string;
            break;
          case "keywords":
            // Check if it's a non-empty string before splitting
            if (typeof value === "string" && value.trim()) {
              newEntity.keywords = value
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean);
              if ((newEntity.keywords as string[]).length === 0)
                delete newEntity.keywords;
            }
            break;
          case "author":
          case "runBy": // For Computation
            if (typeof value === "string" && value.trim()) {
              newEntity[prop.name] = { name: value as string }; // Simple mapping for now
            }
            break;
          case "schema": // Link to a schema definition
            if (typeof value === "string" && value.trim()) {
              newEntity.schema = { "@id": value as string };
            }
            break;
          case "associatedPublication":
          case "additionalDocumentation":
          case "url":
            // Check if it looks like a URL or ARK ID
            if (
              typeof value === "string" &&
              (value.startsWith("http") || value.startsWith("ark:"))
            ) {
              newEntity[prop.name] = { "@id": value };
            } else if (value) {
              // Otherwise, add as plain text description
              newEntity[prop.name] = value;
            }
            break;
          // Add other standard properties directly
          default:
            newEntity[prop.name] = value;
            break;
        }
      });

      // --- Process relationships for Computation entities ---
      if (entityType === "Computation") {
        const relationshipProp = schema.properties.find(
          (p) => p.type === "relationships"
        );
        if (relationshipProp && relationshipProp.config) {
          const config = relationshipProp.config as {
            targets: Array<{ id: string }>;
          };
          config.targets.forEach((target) => {
            const selectedIds = entityData[target.id] as string[] | undefined; // Get IDs from entityData
            if (
              selectedIds &&
              Array.isArray(selectedIds) &&
              selectedIds.length > 0
            ) {
              newEntity[target.id] = selectedIds.map((id) => ({ "@id": id }));
            }
          });
        }
      }

      // --- Clean up any remaining undefined properties ---
      Object.keys(newEntity).forEach(
        (key) =>
          (newEntity as any)[key] === undefined &&
          delete (newEntity as any)[key]
      );

      // --- Add the new entity to the graph ---
      newGraph.push(newEntity);

      // --- Link Dataset/Software entities to the root via hasPart ---
      if (
        (entityType === "Dataset" || entityType === "Software") &&
        rootDatasetIndex !== -1
      ) {
        const rootDataset = newGraph[rootDatasetIndex];
        // Ensure hasPart is an array
        if (!Array.isArray(rootDataset.hasPart)) {
          rootDataset.hasPart = [];
        }
        // Add reference if not already present
        if (
          !(rootDataset.hasPart as Array<{ "@id": string }>).some(
            (part) => part["@id"] === guid
          )
        ) {
          (rootDataset.hasPart as Array<{ "@id": string }>).push({
            "@id": guid,
          });
        }
      }

      return { ...prev, "@graph": newGraph }; // Return updated state
    });

    setCurrentEntityType(null); // Close the form after adding
  };

  // handleDownload remains the same
  const handleDownload = () => {
    const finalMetadata = { ...rocrateMetadata };
    // Potentially add final validation or cleaning here
    const jsonString = JSON.stringify(finalMetadata, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ro-crate-metadata.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCancelAddEntity = () => {
    setCurrentEntityType(null); // Simply close the form
  };

  // renderEntityTable remains the same
  const renderEntityTable = (title: string, entities: ROCrateEntity[]) => (
    <div className="mb-4">
      <h4
        style={{ fontSize: "1.1rem", color: "#495057", marginBottom: "10px" }}
      >
        {title} ({entities.length})
      </h4>
      {entities.length > 0 ? (
        <EntityTableContainer>
          <EntityTable>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity["@id"]}>
                  <td>
                    {entity.name || (
                      <i style={{ color: "#adb5bd" }}>(Unnamed)</i>
                    )}
                  </td>
                  <td
                    title={entity["@id"]}
                    style={{
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entity["@id"]}
                  </td>
                  <td>
                    {/* Simplified type display */}
                    {Array.isArray(entity["@type"])
                      ? entity["@type"]
                          .find((t: string) => t.includes("#"))
                          ?.split("#")[1] || entity["@type"][0].split("/").pop()
                      : typeof entity["@type"] === "string"
                      ? entity["@type"].split("#")[1] ||
                        entity["@type"].split("/").pop()
                      : "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </EntityTable>
        </EntityTableContainer>
      ) : (
        <p style={{ color: "#6c757d", fontSize: "0.9rem", marginTop: "10px" }}>
          No {title.toLowerCase()} added yet.
        </p>
      )}
    </div>
  );

  // getEntitiesByType remains the same (using full URL check)
  const getEntitiesByType = useMemo(
    () =>
      (entityTypeName: keyof typeof entitySchemas): ROCrateEntity[] => {
        const fullTypeUrl = `https://w3id.org/EVI#${entityTypeName}`;
        return rocrateMetadata["@graph"].filter(
          (item) =>
            item["@id"] !== "./" &&
            item["@id"] !== "ro-crate-metadata.json" &&
            (Array.isArray(item["@type"])
              ? item["@type"].some((t: string) => t === fullTypeUrl)
              : item["@type"] === fullTypeUrl)
        );
      },
    [rocrateMetadata]
  );

  const datasets = getEntitiesByType("Dataset");
  const software = getEntitiesByType("Software");
  const computations = getEntitiesByType("Computation");

  // Prepare the list of available entities for the DynamicEntityForm's relationship selector
  const availableEntitiesForSelector: AvailableEntity[] = useMemo(
    () =>
      [...datasets, ...software].map((e) => ({
        // Combine datasets and software
        "@id": e["@id"],
        name: (e.name as string) || "(Unnamed)",
        "@type": e["@type"], // Pass the full type info
      })),
    [datasets, software] // Recompute only when datasets or software change
  );

  return (
    <PageContainer>
      <PageTitle>Create New RO-Crate</PageTitle>

      {step === 1 && (
        <CrateMetadataForm
          // Find the root object, provide defaults if not found or partially formed
          initialData={
            (rocrateMetadata["@graph"].find(
              (item) => item["@id"] === "./"
            ) as Partial<ROCrateEntity & { keywords: string }>) || {
              keywords: "",
            } // Provide minimal default if root not found
          }
          onSave={handleSaveCrateMetadata}
        />
      )}

      {step === 2 && (
        <AddEntitiesSection>
          <FormSectionTitle>
            Manage Datasets, Software, and Computations
          </FormSectionTitle>

          {/* Entity Tables Display */}
          <Row className="mb-4">
            <Col md={4}>{renderEntityTable("Datasets", datasets)}</Col>
            <Col md={4}>{renderEntityTable("Software", software)}</Col>
            <Col md={4}>{renderEntityTable("Computations", computations)}</Col>
          </Row>

          {/* Add Entity Buttons / Form */}
          {!currentEntityType ? (
            <ButtonContainer>
              {/* Buttons to open the form for each type */}
              {(
                Object.keys(entitySchemas) as Array<keyof typeof entitySchemas>
              ).map((type) => (
                <StyledButton
                  key={type}
                  onClick={() => setCurrentEntityType(type)}
                  variant="outline-primary" // Use outline style for add buttons
                >
                  <FiPlus style={{ marginRight: "5px" }} /> Add {type}
                </StyledButton>
              ))}
              {/* Download Button */}
              <StyledButton onClick={handleDownload} variant="success">
                <FiDownload style={{ marginRight: "8px" }} /> Download RO-Crate
                Metadata
              </StyledButton>
            </ButtonContainer>
          ) : (
            // Render the DynamicEntityForm when a type is selected
            <div
              style={{
                marginTop: "30px",
                borderTop: "1px solid #e9ecef",
                paddingTop: "20px",
              }}
            >
              <DynamicEntityForm
                entityType={currentEntityType}
                availableEntities={availableEntitiesForSelector} // Pass available entities
                onAdd={handleAddEntity}
                onCancel={handleCancelAddEntity}
              />
            </div>
          )}
        </AddEntitiesSection>
      )}
    </PageContainer>
  );
};

export default CreateRocratePage;
