import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import FairscapeLogo from "./FairscapeLogo";
import UserProfile from "./UserProfile";
import { AuthContext } from "../../context/AuthContext";

const Header = () => {
  const { isLoggedIn } = useContext(AuthContext);

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
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <a
                href="https://github.com/fairscape/mds_python"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </a>
            </li>
            {!isLoggedIn && (
              <li>
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
          {isLoggedIn && <UserProfile />}
        </div>
      </nav>
    </header>
  );
};

export default Header;
