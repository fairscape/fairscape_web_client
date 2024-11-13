import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MetadataPage from "./pages/MetadataPage";
import UploadOptionsPage from "./pages/UploadOptionsPage";
import UploadPage from "./pages/UploadPage";
import HomePage from "./pages/HomePage";
import MyDashboard from "./pages/MyDashboard";
import PublishPage from "./pages/PublishPage";
import DataverseTokensPage from "./pages/DataverseTokensPage";
import "./global.css";
import "./components/header_footer/Header.css";
import Login from "./components/Login/LoginComponent";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tokens" element={<DataverseTokensPage />} />
        <Route path="/dashboard" element={<MyDashboard />} />
        <Route path="/upload/:type" element={<UploadPage />} />

        {/* Publish first so if it's that it goes there*/}
        <Route path="/publish/*" element={<PublishPage />} />

        {/* General catch-all route last */}
        <Route path="/:type/*" element={<MetadataPage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
