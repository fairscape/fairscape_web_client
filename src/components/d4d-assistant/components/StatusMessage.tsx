import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { colors } from "../../shared/SharedStyles";

interface StatusMessageProps {
  message: string;
  type: "success" | "error" | "info";
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  message,
  type,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible || !message) return null;

  return <Message type={type}>{message}</Message>;
};

const Message = styled.div<{ type: "success" | "error" | "info" }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 6px;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;

  background-color: ${(props) => {
    if (props.type === "success") return colors.successLight;
    if (props.type === "error") return colors.errorLight;
    return colors.primaryLight;
  }};

  color: ${(props) => {
    if (props.type === "success") return colors.success;
    if (props.type === "error") return colors.error;
    return colors.primary;
  }};

  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
