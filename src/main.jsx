import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import MetadataPage from "./pages/MetadataPage";
import SearchPage from "./pages/SearchPage";
import CompareSearchPage from "./pages/CompareSearchPage";
import UploadPage from "./pages/UploadPage";
import HomePage from "./pages/HomePage";
import MyDashboard from "./pages/MyDashboard";
import PublishPage from "./pages/PublishPage";
import DataverseTokensPage from "./pages/DataverseTokensPage";
import BuildAPepPage from "./pages/BuildAPepPage";
import "./global.css";
import "./components/header_footer/Header.css";
import Login from "./components/Login/LoginComponent";
import GenomicDataPage from "./pages/GenomicDataPage";
import DatasheetPage from "./pages/DatasheetPage";

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tokens" element={<DataverseTokensPage />} />
            <Route path="/dashboard" element={<MyDashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/genomic" element={<GenomicDataPage />} />
            <Route path="/publish/*" element={<PublishPage />} />
            <Route path="/:type/*" element={<MetadataPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/compare" element={<CompareSearchPage />} />
            <Route path="/datasheet" element={<DatasheetPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
