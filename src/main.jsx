import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MetadataPage from "./pages/MetadataPage";
import UploadOptionsPage from "./pages/UploadOptionsPage";
import UploadPage from "./pages/UploadPage";
import HomePage from "./pages/HomePage";
import "./global.css";
import "./components/header_footer/Header.css";
import Login from "./components/Login/LoginComponent";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/upload" element={<UploadOptionsPage />} /> */}
        {/* <Route path="/upload/:type" element={<UploadPage />} /> */}
        <Route path="/:type/*" element={<MetadataPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
