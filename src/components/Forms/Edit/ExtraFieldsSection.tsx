import React from "react";
import styled from "styled-components";

interface ExtraFieldsSectionProps {
  extraFields: any;
  onExtraFieldsChange: (fields: any) => void;
}

const ExtraFieldsSection: React.FC<ExtraFieldsSectionProps> = ({
  extraFields,
  onExtraFieldsChange,
}) => {
  if (!extraFields || Object.keys(extraFields).length === 0) {
    return null;
  }

  const handleFieldChange = (key: string, value: string) => {
    onExtraFieldsChange({
      ...extraFields,
      [key]: value,
    });
  };

  const handleAddField = () => {
    const fieldName = prompt("Enter field name:");
    if (fieldName) {
      onExtraFieldsChange({
        ...extraFields,
        [fieldName]: "",
      });
    }
  };

  const handleRemoveField = (key: string) => {
    const updated = { ...extraFields };
    delete updated[key];
    onExtraFieldsChange(updated);
  };

  return (
    <Container>
      <Header>
        <Title>Extra Fields</Title>
        <AddButton onClick={handleAddField}>+ Add Field</AddButton>
      </Header>
      <FieldsContainer>
        {Object.entries(extraFields).map(([key, value]) => (
          <FieldRow key={key}>
            <FieldName>{key}</FieldName>
            <FieldInput
              type="text"
              value={value as string}
              onChange={(e) => handleFieldChange(key, e.target.value)}
            />
            <RemoveButton onClick={() => handleRemoveField(key)}>
              ×
            </RemoveButton>
          </FieldRow>
        ))}
      </FieldsContainer>
    </Container>
  );
};

const Container = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  margin-top: 30px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const AddButton = styled.button`
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #dbeafe;
  }
`;

const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const FieldName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  min-width: 150px;
`;

const FieldInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const RemoveButton = styled.button`
  padding: 8px 12px;
  font-size: 1.25rem;
  color: #ef4444;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fee2e2;
  }
`;

export default ExtraFieldsSection;
