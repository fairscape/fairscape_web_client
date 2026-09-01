// src/AdditionalPropertiesSection.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { AdditionalProperty } from "./interfaces";
import {
  FormSection,
  FormSectionTitle,
  StyledButton,
  StyledInput, // Using StyledInput from previous example
  BaseButton,
  SummaryRow, // Using SummaryRow from previous example
  SummaryLabel, // Using SummaryLabel from previous example
  SummaryValue, // Using SummaryValue from previous example
} from "./SharedComponents"; // Assuming SharedComponents has these

const AdditionalPropertyItem = styled(SummaryRow)`
  border-bottom: 1px dashed #ccc; // Use dashed border for list items
  align-items: center;
  padding: 10px 0;
  margin-bottom: 10px;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
`;

const PropertyNameInput = styled(StyledInput)`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const PropertyValueInput = styled(StyledInput)`
  flex: 2;
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const AddButton = styled(StyledButton).attrs({ variant: "secondary" })`
  min-width: 120px;
  align-self: flex-start; // Align button at the start
`;

const RemoveButton = styled(BaseButton)`
  background-color: #dc3545; // Red color for remove
  padding: 6px 10px;
  min-width: unset;
  svg {
    margin-right: 0; // Remove gap for icon button
  }
  &:hover:not(:disabled) {
    background-color: #c82333;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap; // Allow wrapping on small screens
`;

const InputColumn = styled.div`
  flex: 1;
  min-width: 150px; // Ensure inputs don't get too small
`;

const ButtonColumn = styled.div`
  flex-shrink: 0;
`;

interface AdditionalPropertiesSectionProps {
  additionalProperties: AdditionalProperty[];
  onAddProperty: (prop: { name: string; value: string }) => void;
  onRemoveProperty: (id: string) => void;
}

const AdditionalPropertiesSection: React.FC<
  AdditionalPropertiesSectionProps
> = ({ additionalProperties, onAddProperty, onRemoveProperty }) => {
  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddClick = () => {
    if (newName.trim() && newValue.trim()) {
      onAddProperty({ name: newName.trim(), value: newValue.trim() });
      setNewName("");
      setNewValue("");
    } else {
      alert(
        "Please enter both a name and a value for the additional property.",
      );
    }
  };

  return (
    <FormSection>
      <FormSectionTitle>Additional Properties</FormSectionTitle>

      {/* List Existing Properties */}
      {additionalProperties.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          {additionalProperties.map((prop) => (
            <AdditionalPropertyItem key={prop.id}>
              {/* Use SummaryLabel/SummaryValue structure for consistency */}
              <SummaryLabel
                style={{
                  flexBasis: "200px",
                  maxWidth: "200px",
                  paddingRight: "10px",
                }}
              >
                {prop.name}
              </SummaryLabel>
              <SummaryValue
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  minWidth: "250px",
                }}
              >
                <span
                  style={{
                    flexGrow: 1,
                    wordBreak: "break-word",
                    paddingRight: "10px",
                  }}
                >
                  {prop.value}
                </span>
                <RemoveButton onClick={() => onRemoveProperty(prop.id)}>
                  <FiTrash2 size={16} />
                </RemoveButton>
              </SummaryValue>
            </AdditionalPropertyItem>
          ))}
        </div>
      )}

      {/* Add New Property Form */}
      <div>
        <h4>Add New</h4>
        <InputRow>
          <InputColumn>
            <StyledInput
              type="text"
              placeholder="Property Name (e.g., subject_area)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </InputColumn>
          <InputColumn style={{ flex: 2 }}>
            <StyledInput
              type="text"
              placeholder="Property Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </InputColumn>
          <ButtonColumn>
            <AddButton onClick={handleAddClick}>
              <FiPlus size={16} /> Add Property
            </AddButton>
          </ButtonColumn>
        </InputRow>
        <small
          style={{
            display: "block",
            color: "#555",
            fontStyle: "italic",
            marginBottom: "15px",
          }}
        >
          These will be added as `@type: PropertyValue` nodes.
        </small>
      </div>
    </FormSection>
  );
};

export default AdditionalPropertiesSection;
