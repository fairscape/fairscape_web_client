import React from "react";
import { FiInfo } from "react-icons/fi";
import {
  ConfirmDialog as StyledConfirmDialog,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogText,
  DialogNote,
  DialogActions,
  DialogCancelButton,
  DialogConfirmButton,
} from "../styles/D4DAssistant.styles";

interface ConfirmDialogProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  onCancel,
  onConfirm,
  loading,
}) => {
  if (!show) return null;

  return (
    <StyledConfirmDialog>
      <DialogOverlay onClick={onCancel} />
      <DialogContent>
        <DialogTitle>Ready to finish the D4D creation process?</DialogTitle>
        <DialogBody>
          <DialogText>
            This will complete your interaction with the AI assistant.
          </DialogText>
          <DialogText>
            The created D4D datasheet will be finalized and available for review
            in FAIRSCAPE.
          </DialogText>
          <DialogNote>
            <FiInfo size={16} />
            <span>
              You can always create a new issue if you need further
              modifications later.
            </span>
          </DialogNote>
        </DialogBody>
        <DialogActions>
          <DialogCancelButton onClick={onCancel}>Cancel</DialogCancelButton>
          <DialogConfirmButton onClick={onConfirm} disabled={loading}>
            {loading ? "Finalizing..." : "Review Created D4D"}
          </DialogConfirmButton>
        </DialogActions>
      </DialogContent>
    </StyledConfirmDialog>
  );
};
