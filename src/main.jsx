import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MetadataPage from "./pages/MetadataPage";
import UploadOptionsPage from "./pages/UploadOptionsPage";
import UploadPage from "./pages/UploadPage";
import HomePage from "./pages/HomePage";
import "./global.css";
import "./components/Header.css";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<UploadOptionsPage />} />
        <Route path="/upload/:type" element={<UploadPage />} />
        <Route path="/:type/*" element={<MetadataPage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
