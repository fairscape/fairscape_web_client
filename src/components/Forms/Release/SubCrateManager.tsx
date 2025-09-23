import React, { useState } from "react";
import styled from "styled-components";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { generateSubCrateId } from "../utils/releaseUtils";

interface SubCrate {
  "@id": string;
  "@type": string[];
  name: string;
  description: string;
  version: string;
  keywords?: string;
  "ro-crate-metadata": string;
}

interface SubCrateManagerProps {
  subCrates: SubCrate[];
  onSubCratesChange: (subCrates: SubCrate[]) => void;
  existingHasPart: any[];
  onHasPartChange: (hasPart: any[]) => void;
  disabled?: boolean;
}

const SubCrateManager: React.FC<SubCrateManagerProps> = ({
  subCrates,
  onSubCratesChange,
  existingHasPart,
  onHasPartChange,
  disabled = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubCrate, setNewSubCrate] = useState<Partial<SubCrate>>({
    name: "",
    description: "",
    version: "1.0",
    keywords: "",
    "ro-crate-metadata": "",
  });

  const handleAddSubCrate = () => {
    if (!newSubCrate.name || !newSubCrate.description) {
      alert("Name and description are required for sub-crates");
      return;
    }

    const subCrateId = generateSubCrateId(newSubCrate.name);
    const fullSubCrate: SubCrate = {
      "@id": subCrateId,
      "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"],
      name: newSubCrate.name,
      description: newSubCrate.description,
      version: newSubCrate.version || "1.0",
      keywords: newSubCrate.keywords,
      "ro-crate-metadata": newSubCrate["ro-crate-metadata"] || "",
    };

    onSubCratesChange([...subCrates, fullSubCrate]);

    setNewSubCrate({
      name: "",
      description: "",
      version: "1.0",
      keywords: "",
      "ro-crate-metadata": "",
    });
    setShowAddForm(false);
  };

  const handleRemoveSubCrate = (id: string) => {
    onSubCratesChange(subCrates.filter((sc) => sc["@id"] !== id));
  };

  const handleRemoveExistingHasPart = (id: string) => {
    onHasPartChange(existingHasPart.filter((hp) => hp["@id"] !== id));
  };

  const nonSubCrateHasPart = existingHasPart.filter(
    (hp) => !subCrates.some((sc) => sc["@id"] === hp["@id"])
  );

  return (
    <Container>
      <SectionTitle>Sub-Crates & References</SectionTitle>

      {nonSubCrateHasPart.length > 0 && (
        <SubSection>
          <SubTitle>Existing References (hasPart)</SubTitle>
          <ReferenceList>
            {nonSubCrateHasPart.map((ref) => (
              <ReferenceItem key={ref["@id"]}>
                <ReferenceId>{ref["@id"]}</ReferenceId>
                <RemoveButton
                  onClick={() => handleRemoveExistingHasPart(ref["@id"])}
                  title="Remove reference"
                >
                  <FiTrash2 />
                </RemoveButton>
              </ReferenceItem>
            ))}
          </ReferenceList>
        </SubSection>
      )}

      {subCrates.length > 0 && (
        <SubSection>
          <SubTitle>Sub-Crates</SubTitle>
          <SubCrateList>
            {subCrates.map((subCrate) => (
              <SubCrateItem key={subCrate["@id"]}>
                <SubCrateInfo>
                  <SubCrateName>{subCrate.name}</SubCrateName>
                  <SubCrateId>{subCrate["@id"]}</SubCrateId>
                  {subCrate["ro-crate-metadata"] && (
                    <SubCratePath>
                      Path: {subCrate["ro-crate-metadata"]}
                    </SubCratePath>
                  )}
                </SubCrateInfo>
                <RemoveButton
                  onClick={() => handleRemoveSubCrate(subCrate["@id"])}
                  title="Remove sub-crate"
                >
                  <FiTrash2 />
                </RemoveButton>
              </SubCrateItem>
            ))}
          </SubCrateList>
        </SubSection>
      )}

      {!showAddForm && (
        <AddButton onClick={() => setShowAddForm(true)}>
          <FiPlus /> Add Sub-Crate
        </AddButton>
      )}

      {showAddForm && (
        <AddFormContainer>
          <FormHeader>
            <FormTitle>Add New Sub-Crate</FormTitle>
            <CloseButton onClick={() => setShowAddForm(false)}>
              <FiX />
            </CloseButton>
          </FormHeader>

          <FormField>
            <Label>
              Name <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={newSubCrate.name || ""}
              onChange={(e) =>
                setNewSubCrate({ ...newSubCrate, name: e.target.value })
              }
              placeholder="Sub-crate name"
            />
          </FormField>

          <FormField>
            <Label>
              Description <Required>*</Required>
            </Label>
            <TextArea
              value={newSubCrate.description || ""}
              onChange={(e) =>
                setNewSubCrate({ ...newSubCrate, description: e.target.value })
              }
              placeholder="Describe this sub-crate"
              rows={3}
            />
          </FormField>

          <FormField>
            <Label>Version</Label>
            <Input
              type="text"
              value={newSubCrate.version || ""}
              onChange={(e) =>
                setNewSubCrate({ ...newSubCrate, version: e.target.value })
              }
              placeholder="1.0"
            />
          </FormField>

          <FormField>
            <Label>Keywords</Label>
            <Input
              type="text"
              value={newSubCrate.keywords || ""}
              onChange={(e) =>
                setNewSubCrate({ ...newSubCrate, keywords: e.target.value })
              }
              placeholder="Comma-separated keywords"
            />
          </FormField>

          <FormField>
            <Label>
              Local Path to ro-crate-metadata.json <Required>*</Required>
            </Label>
            <Input
              type="text"
              value={newSubCrate["ro-crate-metadata"] || ""}
              onChange={(e) =>
                setNewSubCrate({
                  ...newSubCrate,
                  "ro-crate-metadata": e.target.value,
                })
              }
              placeholder="e.g., ./sub-crates/experiment-1/ro-crate-metadata.json"
            />
          </FormField>

          <ButtonGroup>
            <SaveButton onClick={handleAddSubCrate}>Add Sub-Crate</SaveButton>
            <CancelButton onClick={() => setShowAddForm(false)}>
              Cancel
            </CancelButton>
          </ButtonGroup>
        </AddFormContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  color: #3e7aa8;
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
`;

const SubSection = styled.div`
  margin-bottom: 20px;
`;

const SubTitle = styled.h4`
  color: #555;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const ReferenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const ReferenceId = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: #666;
`;

const SubCrateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SubCrateItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
`;

const SubCrateInfo = styled.div`
  flex: 1;
`;

const SubCrateName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const SubCrateId = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const SubCratePath = styled.div`
  font-size: 12px;
  color: #888;
  font-style: italic;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #2c5f8d;
  }
`;

const AddFormContainer = styled.div`
  border: 2px solid #3e7aa8;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  background: #fafbfc;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FormTitle = styled.h4`
  color: #3e7aa8;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
`;

const FormField = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
`;

const Required = styled.span`
  color: #dc3545;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
    box-shadow: 0 0 0 2px rgba(62, 122, 168, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3e7aa8;
    box-shadow: 0 0 0 2px rgba(62, 122, 168, 0.1);
  }
`;

const ButtonGroup = styled.div`
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

export default SubCrateManager;
