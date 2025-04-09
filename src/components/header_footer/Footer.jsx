import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="social">
          <a
            href="https://github.com/fairscape/fairscape.github.io"
            target="_blank"
            rel="noopener noreferrer"
            title="Go to repository"
            className="social__link"
          >
            GitHub
          </a>
        </div>
        <div className="admin-notice">
          This repository is under review for potential modification in
          compliance with Administration directives.
        </div>
        <div className="copyright">
          <span className="highlight">Copyright © University of Virginia</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
