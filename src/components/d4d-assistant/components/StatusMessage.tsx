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
  border-radius: 2px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  background-color: ${(s) => (s.type === "success" ? y.successLight : s.type === "error" ? y.errorLight : y.primaryLight)};

  color: ${(s) => (s.type === "success" ? y.success : s.type === "error" ? y.error : y.primary)};

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
