import React, { useState } from "react";
import styled from "styled-components";
import { FiChevronRight, FiChevronDown, FiPlus } from "react-icons/fi";
import { Card } from "../ReleaseComponents";

interface ExtraFieldsSectionProps {
  extraFields: any;
  onExtraFieldsChange: (fields: any) => void;
}

const ExtraFieldsSection: React.FC<ExtraFieldsSectionProps> = ({
  extraFields,
  onExtraFieldsChange,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState<"json" | "fields">("fields");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  const handleFieldChange = (key: string, value: any) => {
    onExtraFieldsChange({
      ...extraFields,
      [key]: value,
    });
  };

  const handleDeleteField = (key: string) => {
    const newFields = { ...extraFields };
    delete newFields[key];
    onExtraFieldsChange(newFields);
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) {
      alert("Field name is required");
      return;
    }

    if (extraFields[newFieldName]) {
      alert(`Field "${newFieldName}" already exists`);
      return;
    }

    onExtraFieldsChange({
      ...extraFields,
      [newFieldName]: newFieldValue,
    });

    setNewFieldName("");
    setNewFieldValue("");
    setShowAddForm(false);
  };

  const handleJsonChange = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      onExtraFieldsChange(parsed);
    } catch (e) {}
  };

  const fieldCount = Object.keys(extraFields).length;

  return (
    <Container>
      <SectionHeader
        onClick={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
      >
        <HeaderLeft>
          {collapsed ? <FiChevronRight /> : <FiChevronDown />}
          Additional Fields ({fieldCount})
        </HeaderLeft>
      </SectionHeader>

      {!collapsed && (
        <SectionContent>
          <ModeToggle>
            <ModeButton
              active={editMode === "fields"}
              onClick={() => setEditMode("fields")}
            >
              Field View
            </ModeButton>
            <ModeButton
              active={editMode === "json"}
              onClick={() => setEditMode("json")}
            >
              JSON View
            </ModeButton>
          </ModeToggle>

          {editMode === "fields" ? (
            <>
              <FieldList>
                {fieldCount === 0 ? (
                  <EmptyMessage>No additional fields</EmptyMessage>
                ) : (
                  Object.entries(extraFields).map(([key, value]) => (
                    <FieldItem key={key}>
                      <FieldKey>{key}</FieldKey>
                      <FieldValueInput
                        value={
                          typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)
                        }
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                      />
                      <DeleteButton onClick={() => handleDeleteField(key)}>
                        Delete
                      </DeleteButton>
                    </FieldItem>
                  ))
                )}
              </FieldList>

              {!showAddForm && (
                <AddFieldButton onClick={() => setShowAddForm(true)}>
                  <FiPlus /> Add Field
                </AddFieldButton>
              )}

              {showAddForm && (
                <AddFieldForm>
                  <FormTitle>Add New Field</FormTitle>
                  <FormRow>
                    <FormLabel>Field Name</FormLabel>
                    <FormInput
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="e.g., customProperty"
                    />
                  </FormRow>
                  <FormRow>
                    <FormLabel>Field Value</FormLabel>
                    <FormInput
                      type="text"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                      placeholder="Enter value"
                    />
                  </FormRow>
                  <FormButtons>
                    <SaveButton onClick={handleAddField}>Add</SaveButton>
                    <CancelButton
                      onClick={() => {
                        setShowAddForm(false);
                        setNewFieldName("");
                        setNewFieldValue("");
                      }}
                    >
                      Cancel
                    </CancelButton>
                  </FormButtons>
                </AddFieldForm>
              )}
            </>
          ) : (
            <JsonEditor
              value={JSON.stringify(extraFields, null, 2)}
              onChange={(e) => handleJsonChange(e.target.value)}
              rows={15}
            />
          )}
        </SectionContent>
      )}
    </Container>
  );
};

const Container = styled(Card)`
  margin-bottom: 20px;
  overflow: hidden;
`;

const SectionHeader = styled.div<{ collapsed?: boolean }>`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px;
  font-weight: 600;
  padding-bottom: ${(props) => (props.collapsed ? "0" : "10px")};
  margin-bottom: ${(props) => (props.collapsed ? "0" : "20px")};
  border-bottom: ${(props) =>
    props.collapsed ? "none" : `2px solid ${props.theme.colors.border}`};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionContent = styled.div`
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const ModeButton = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  background: ${(props) =>
    props.active ? props.theme.colors.primary : props.theme.colors.border};
  color: ${(props) =>
    props.active ? "white" : props.theme.colors.textSecondary};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 20px;
  font-style: italic;
`;

const FieldItem = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
`;

const FieldKey = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-family: monospace;
  font-size: 14px;
`;

const FieldValueInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}1a;
  }
`;

const DeleteButton = styled.button`
  padding: 8px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background: #c82333;
  }
`;

const AddFieldButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    filter: brightness(0.9);
  }

  svg {
    font-size: 16px;
  }
`;

const AddFieldForm = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 20px;
  margin-top: 16px;
  background: ${({ theme }) => theme.colors.background};
`;

const FormTitle = styled.h4`
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 16px 0;
  font-size: 16px;
`;

const FormRow = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}1a;
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #218838;
  }
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #5a6268;
  }
`;

const JsonEditor = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}1a;
  }
`;

export default ExtraFieldsSection;
