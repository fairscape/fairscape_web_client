import React from "react";
import { useParams } from "react-router-dom";
import Upload from "../components/UploadForm/Upload";
import "./UploadPage.css";

const UploadPage = () => {
  const { type } = useParams();

  return (
    <div>
      <h1>RO-Crate Upload</h1>
      <Upload />
    </div>
  );
};

export default UploadPage;
