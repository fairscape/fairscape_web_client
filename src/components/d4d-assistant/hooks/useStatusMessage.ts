import { useState } from "react";

type StatusType = "idle" | "success" | "error";

export const useStatusMessage = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<StatusType>("idle");

  const showStatus = (msg: string, statusType: StatusType) => {
    setMessage(msg);
    setType(statusType);
    setTimeout(() => setType("idle"), 3000);
  };

  return { message, type, showStatus };
};
