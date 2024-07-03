import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header_footer/Header";
import "./UploadOptionsPage.css"; // Import the CSS file for this component
import Footer from "../components/header_footer/Footer";

const UploadOptionsPage = () => {
  return (
    <div className="upload-options-page">
      <Header />
      <main className="main-content">
        <h1>Upload Options</h1>
        <div className="options-grid">
          <div className="option-box">
            <h2>ROCrate</h2>
            <p>Upload and manage ROCrates.</p>
            <Link to="/upload/ROCrate" className="option-link">
              ROCrate Upload
            </Link>
          </div>
          <div className="option-box">
            <h2>Dataset</h2>
            <p>Upload and manage datasets.</p>
            <Link to="/upload/Dataset" className="option-link">
              Dataset Upload
            </Link>
          </div>
          <div className="option-box">
            <h2>Software</h2>
            <p>Upload and manage software.</p>
            <Link to="/upload/Software" className="option-link">
              Software Upload
            </Link>
          </div>
          <div className="option-box">
            <h2>Schema</h2>
            <p>Upload and manage schemas.</p>
            <Link to="/upload/Schema" className="option-link">
              Schema Upload
            </Link>
          </div>
          <div className="option-box">
            <h2>Computation</h2>
            <p>Upload and manage computation details.</p>
            <Link to="/upload/Computation" className="option-link">
              Computation Upload
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UploadOptionsPage;
