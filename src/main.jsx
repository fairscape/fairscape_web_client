import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MetadataPage from "./pages/MetadataPage";
import UploadOptionsPage from "./pages/UploadOptionsPage";
import UploadROCratePage from "./pages/UploadROCratePage";
import HomePage from "./pages/HomePage";
import "./global.css";
import "./components/Header.css";
import "./pages/UploadROCratePage.css";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadOptionsPage />} />
        <Route path="/:type/*" element={<MetadataPage />} />
        <Route path="/upload-rocrate" element={<UploadROCratePage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
