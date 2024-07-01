import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import FairscapeLogo from "./FairscapeLogo";
import UserProfile from "./UserProfile";

const Header = () => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-brand">
          <FairscapeLogo />
          <Link to="/" className="logo">
            Fairscape
          </Link>
        </div>
        <div className="navbar-right">
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
          <UserProfile />
        </div>
      </nav>
    </header>
  );
};

export default Header;
