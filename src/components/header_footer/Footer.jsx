import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-meta">
        <div className="footer-meta__inner">
          <div className="copyright">
            <div className="highlight">Copyright © University of Virginia</div>
          </div>
          <div className="social">
            <a
              href="https://github.com/fairscape/fairscape.github.io"
              target="_blank"
              rel="noopener"
              title="Go to repository"
              className="social__link"
            ></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
