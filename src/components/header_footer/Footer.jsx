import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="copyright">
          <span className="highlight">Copyright © University of Virginia</span>
        </div>
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
      </div>
    </footer>
  );
};

export default Footer;
