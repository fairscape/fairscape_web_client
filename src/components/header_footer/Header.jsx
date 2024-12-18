// Header.jsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import "./Header.css";
import FairscapeLogo from "./FairscapeLogo";
import UserProfile from "./UserProfile";
import { AuthContext } from "../../context/AuthContext";

const AlertOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const AlertDialog = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  text-align: center;
  position: relative;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  &::before {
    content: "×";
  }
`;

const AlertMessage = styled.p`
  margin: 0;
  color: #4a5568;
  font-size: 16px;
  line-height: 1.5;
  padding-right: 20px;
`;

const Header = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  const handleShowLogoutAlert = (message) => {
    setLogoutMessage(message);
    setShowLogoutAlert(true);
  };

  const handleCloseAlert = () => {
    setShowLogoutAlert(false);
    // Only navigate after user closes the alert
    window.location.href = "/";
  };

  return (
    <>
      <header className="header">
        <nav className="navbar">
          <div className="navbar-brand">
            <FairscapeLogo />
            <Link to="/" className="logo">
              fairscape
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
                <Link to="/upload">Upload</Link>
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
            {isLoggedIn && <UserProfile onLogout={handleShowLogoutAlert} />}
          </div>
        </nav>
      </header>

      {showLogoutAlert && (
        <AlertOverlay>
          <AlertDialog>
            <CloseButton onClick={handleCloseAlert} aria-label="Close" />
            <AlertMessage>{logoutMessage}</AlertMessage>
          </AlertDialog>
        </AlertOverlay>
      )}
    </>
  );
};

export default Header;
