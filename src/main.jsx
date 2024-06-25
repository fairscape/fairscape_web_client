import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MetadataPage from "./pages/MetadataPage";
import UploadROCratePage from "./pages/UploadROCratePage";
import HomePage from "./pages/HomePage";
import "./global.css"; // Import the global CSS file
import "./components/Header.css"; // Import the CSS file for the header
import "./pages/UploadROCratePage.css"; // Import the new CSS file

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:type/*" element={<MetadataPage />} />
        <Route path="/upload-rocrate" element={<UploadROCratePage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
