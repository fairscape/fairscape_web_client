import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MetadataPage from "./MetadataPage";
import "./global.css";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/:type/*" element={<MetadataPage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
