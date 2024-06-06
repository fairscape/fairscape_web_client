import React from "react";
import ReactDOM from "react-dom";
import MetadataPage from "./MetadataPage";
import "./global.css";

ReactDOM.render(
  <React.StrictMode>
    <MetadataPage type={"ROCrate"} />
  </React.StrictMode>,
  document.getElementById("root")
);
