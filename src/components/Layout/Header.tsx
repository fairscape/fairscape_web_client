// src/components/Layout/Header.tsx
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext"; // Assuming path
import UserProfile from "./UserProfile";
// Import your logo - make sure path is correct
import FairscapeLogoSvg from "../../assets/logo.svg";

const StyledHeader = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;

  &:hover {
    text-decoration: none; // Override global style if needed
    color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const LogoImage = styled.img`
  height: 40px;
  width: 40px;
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li``;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  text-decoration: none;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &::after {
      width: 100%;
    }
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
  }
`;

const ExternalLink = styled.a`
  /* Similar styling as NavLink */
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  text-decoration: none;
  padding: ${({ theme }) => theme.spacing.xs} 0;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &::after {
      width: 100%;
    }
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
  }
`;

const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");

  if (!authContext) {

    console.error("AuthContext not available in Header");
    return <StyledHeader>Loading Auth...</StyledHeader>;
  }

  const { isLoggedIn, logout } = authContext;

  const handleShowLogoutAlert = (message: string) => {
    setLogoutMessage(message);
    setShowLogoutAlert(true);
  };

  const handleCloseAlert = () => {
    setShowLogoutAlert(false);
    window.location.href = "/";
  };

  return (
    <>
      <StyledHeader>
        <Navbar>
          <Brand>
            <LogoLink to="/">
              <LogoImage src={FairscapeLogoSvg} alt="Fairscape Logo" />
              fairscape
            </LogoLink>
          </Brand>
          <NavLinks>
            <NavItem>
              <NavLink to="/">Home</NavLink>
            </NavItem>
            {isLoggedIn && ( // Only show Dashboard if logged in
              <NavItem>
                <NavLink to="/dashboard">Dashboard</NavLink>
              </NavItem>
            )}
            <NavItem>
              <NavLink to="/upload">Upload</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/search">Search</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/dashboard">Dashboard</NavLink>
            </NavItem>
            <NavItem>
              <ExternalLink
                href="https://fairscape.github.io/fairscape-cli/" // Example Doc Link
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </ExternalLink>
            </NavItem>
            {!isLoggedIn && (
              <NavItem>
                <NavLink to="/login">Login</NavLink>
              </NavItem>
            )}
            {isLoggedIn && <UserProfile onLogout={handleShowLogoutAlert} />}
          </NavLinks>
        </Navbar>
      </StyledHeader>
      {showLogoutAlert && (
        <div /* Your Alert Overlay */>
          <div /* Your Alert Dialog */>
            <button onClick={handleCloseAlert}>×</button>
            <p>{logoutMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
