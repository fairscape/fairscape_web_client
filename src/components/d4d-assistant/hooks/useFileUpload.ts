import { useState } from "react";

export const useFileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const clearFiles = () => setFiles([]);

  return { files, handleFileSelect, clearFiles };
};
