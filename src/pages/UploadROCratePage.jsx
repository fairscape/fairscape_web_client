import React, { useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import "./UploadROCratePage.css"; // Import the CSS file for this component

const UploadROCratePage = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload-rocrate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Failed to upload file.");
    }
  };

  return (
    <div className="upload-page">
      <Header />
      <div className="container">
        <h2>Upload ROCrate</h2>
        <form onSubmit={handleSubmit} className="upload-form">
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
          />
          <button type="submit" className="upload-button">
            Upload
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default UploadROCratePage;
