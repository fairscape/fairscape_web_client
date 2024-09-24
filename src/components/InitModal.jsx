import React from "react";
import styled from "styled-components";
import { Modal, Button } from "react-bootstrap";

const StyledModal = styled(Modal)`
  .modal-content {
    background-color: #282828;
    color: #ffffff;
  }
`;

const ModalButton = styled(Button)`
  margin-right: 10px;
`;

function InitModal({ show, onHide, onInit }) {
  return (
    <StyledModal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Initialize RO-Crate</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        The selected directory is not a valid RO-Crate. It should contain an
        ro-crate-metadata.json file. Would you like to initialize it?
      </Modal.Body>
      <Modal.Footer>
        <ModalButton variant="secondary" onClick={onHide}>
          Cancel
        </ModalButton>
        <ModalButton variant="primary" onClick={onInit}>
          Init
        </ModalButton>
      </Modal.Footer>
    </StyledModal>
  );
}

export default InitModal;
