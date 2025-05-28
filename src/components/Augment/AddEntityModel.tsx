// src/AddEntityModal.tsx
import React from "react";
import styled from "styled-components";
import AddEntityForm from "./AddEntityForm"; // Import the adapted form
import { AvailableEntity } from "./interfaces";

// Basic Modal Backdrop
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; // Higher than typical Bootstrap navbar/modal-backdrop
`;

// Basic Modal Content Area
const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1060;
`;

interface AddEntityModalProps {
  entityType: string;
  availableEntities: AvailableEntity[];
  onSave: (entityData: any) => void; // Pass the entity data back
  onClose: () => void;
}

const AddEntityModal: React.FC<AddEntityModalProps> = ({
  entityType,
  availableEntities,
  onSave,
  onClose,
}) => {
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {" "}
        {/* Prevent closing when clicking inside */}
        <AddEntityForm
          entityType={entityType}
          availableEntities={availableEntities}
          onAdd={onSave} // Map onAdd from form to onSave from modal
          onCancel={onClose}
        />
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AddEntityModal;
