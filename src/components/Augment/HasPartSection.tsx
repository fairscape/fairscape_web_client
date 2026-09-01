// src/HasPartSection.tsx
import React from "react";
import styled from "styled-components";
import { FiPlus } from "react-icons/fi";
import { CrateEntity } from "./interfaces";
import { getSimpleEntityType } from "./utils"; // Import helper
import {
  FormSection,
  FormSectionTitle,
  StyledButton,
  BaseButton,
  ButtonContainer,
  EntityTableContainer, // Assuming these exist in SharedComponents
  EntityTable,
} from "./SharedComponents"; // Assuming these are in SharedComponents

const AddEntityButton = styled(StyledButton).attrs({ variant: "success" })`
  margin: 0 10px;
  margin-bottom: 10px; // Space below buttons if they wrap
  min-width: 180px;
`;

const EntityButtonsContainer = styled(ButtonContainer)`
  justify-content: flex-start; // Align buttons to the left
  margin-top: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

interface HasPartSectionProps {
  hasPartEntities: CrateEntity[];
  onAddEntityClick: (entityType: string) => void; // Callback to parent
  // Optional: onRemoveEntity: (id: string) => void; // If removal is needed
}

const HasPartSection: React.FC<HasPartSectionProps> = ({
  hasPartEntities,
  onAddEntityClick,
}) => {
  return (
    <FormSection>
      <FormSectionTitle>Included Entities (hasPart)</FormSectionTitle>

      {/* List Existing Entities */}
      {hasPartEntities.length > 0 ? (
        <EntityTableContainer>
          <EntityTable>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Type(s)</th>
                <th>Version</th>
                <th>Author</th>
                {/* Add other relevant columns */}
              </tr>
            </thead>
            <tbody>
              {hasPartEntities.map((entity) => (
                <tr key={entity["@id"]}>
                  <td>{entity.name || "(Unnamed)"}</td>
                  <td title={entity["@id"]}>
                    {entity["@id"].substring(0, 25)}...
                  </td>
                  <td>{getSimpleEntityType(entity["@type"])}</td>
                  <td>{entity.version || "-"}</td>
                  <td>
                    {Array.isArray(entity.author)
                      ? entity.author
                          .map((a: any) =>
                            typeof a === "object" && a.name ? a.name : a,
                          )
                          .join(", ")
                      : typeof entity.author === "object" && entity.author?.name
                        ? entity.author.name
                        : entity.author || "-"}
                  </td>
                  {/* Add other cells */}
                </tr>
              ))}
            </tbody>
          </EntityTable>
        </EntityTableContainer>
      ) : (
        <p style={{ textAlign: "center", color: "#777", marginBottom: "20px" }}>
          No entities included yet. Add Datasets, Software, or Computations
          below.
        </p>
      )}

      {/* Add New Entity Buttons */}
      <EntityButtonsContainer>
        {/* These strings must match keys in entitySchemas.json */}
        <AddEntityButton onClick={() => onAddEntityClick("Dataset")}>
          <FiPlus size={16} /> Add Dataset
        </AddEntityButton>
        <AddEntityButton onClick={() => onAddEntityClick("Software")}>
          <FiPlus size={16} /> Add Software
        </AddEntityButton>
        <AddEntityButton onClick={() => onAddEntityClick("Computation")}>
          <FiPlus size={16} /> Add Computation
        </AddEntityButton>
        {/* Add buttons for other entity types if needed */}
      </EntityButtonsContainer>
    </FormSection>
  );
};

export default HasPartSection;
