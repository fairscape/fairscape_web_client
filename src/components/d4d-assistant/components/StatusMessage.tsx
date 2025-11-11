import React from "react";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import { StatusMessage as StyledStatusMessage } from "../styles/D4DAssistant.styles";

interface StatusMessageProps {
  message: string;
  type: "idle" | "success" | "error";
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  message,
  type,
}) => {
  if (type === "idle") return null;

  return (
    <StyledStatusMessage status={type}>
      {type === "success" && <FiCheck size={20} />}
      {type === "error" && <FiAlertCircle size={20} />}
      <span>{message}</span>
    </StyledStatusMessage>
  );
};
