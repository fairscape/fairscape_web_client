import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const alertStyles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-500",
    titleColor: "text-green-800",
    messageColor: "text-green-700",
    Icon: CheckCircle2,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-500",
    titleColor: "text-red-800",
    messageColor: "text-red-700",
    Icon: AlertCircle,
  },
};

const Alert = ({ type, title, message }) => {
  const styles = alertStyles[type];

  return (
    <div
      className={`${styles.bg} border-l-4 ${styles.border} p-4 mb-6 rounded-r-md shadow-sm`}
    >
      <div className="flex items-start">
        <styles.Icon className={`h-5 w-5 ${styles.titleColor}`} />
        <div className="ml-3">
          <h3 className={`${styles.titleColor} font-medium`}>{title}</h3>
          <p className={styles.messageColor}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
