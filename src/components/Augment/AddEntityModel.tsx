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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

// Basic Modal Content Area
const ModalContent = styled.div`
  background: white;
  border-radius: 2px;
  width: 90%;
  max-width: 500px;
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
