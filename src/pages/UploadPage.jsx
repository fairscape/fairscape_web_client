import React from "react";
import { useParams } from "react-router-dom";
import GenericUploadComponent from "../components/GenericUploadComponent";
import Header from "../components/header_footer/Header";
import Footer from "../components/header_footer/Footer";
import "./UploadPage.css";

const UploadPage = () => {
  const { type } = useParams();

  return (
    <div>
      <Header />
      <h1>Upload {type}</h1>
      <GenericUploadComponent type={type} />
      <Footer />
    </div>
  );
};

export default UploadPage;
