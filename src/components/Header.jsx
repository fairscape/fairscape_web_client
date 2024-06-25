import React from "react";
import "./Header.css";
import FairscapeLogo from "./FairscapeLogo"; // Import the logo component

const Header = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-brand">
          <FairscapeLogo /> {/* Use the logo component */}
          <a href="#" className="logo">
            Fairscape
          </a>
        </div>
        <ul className="nav-links">
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">About</a>
          </li>
          <li>
            <a href="#">Documentation</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
