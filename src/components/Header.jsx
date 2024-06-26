import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import FairscapeLogo from "./FairscapeLogo"; // Import the logo component

const Header = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-brand">
          <FairscapeLogo /> {/* Use the logo component */}
          <Link to="/" className="logo">
            Fairscape
          </Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/upload">Upload</Link>
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
