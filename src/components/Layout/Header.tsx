// src/components/Layout/Header.tsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../../context/AuthContext"; // Assuming path
import UserProfile from "./UserProfile";
// Import your logo - make sure path is correct
import FairscapeLogoSvg from "../../assets/logo.svg";

const StyledHeader = styled.header`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 0 ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const MenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 8px;
  font-size: 20px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.ink};

  @media (max-width: 768px) {
    display: block;
  }
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
  font-size: 1.1rem;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.ink};
  text-decoration: none;

  &:hover {
    text-decoration: none; // Override global style if needed
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LogoImage = styled.img`
  height: 28px;
  width: 28px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
`;

const NavLinks = styled.ul<{ $open?: boolean }>`
  list-style: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    display: ${({ $open }) => ($open ? "flex" : "none")};
    flex-basis: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 0;
    padding-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const NavItem = styled.li``;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: inline-block;
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  padding: 20px 0;
  box-shadow: ${({ theme, $active }) => ($active ? `inset 0 -2px 0 ${theme.colors.primary}` : "none")};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  @media (max-width: 768px) {
    padding: 12px 0;
  }
`;

const ExternalLink = styled.a`
  display: inline-block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  padding: 20px 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  @media (max-width: 768px) {
    padding: 12px 0;
  }
`;

const Header: React.FC = () => {
  const authContext = useContext(AuthContext);
  const location = useLocation();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (!authContext) {
    console.error("AuthContext not available in Header");
    return <StyledHeader>Loading Auth...</StyledHeader>;
  }

  const { isLoggedIn, logout } = authContext;

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

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
          <MenuToggle
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "✕" : "☰"}
          </MenuToggle>
          <NavLinks $open={menuOpen}>
            <NavItem>
              <NavLink to="/about" $active={isActive("/about")}>
                About
              </NavLink>
            </NavItem>
            {isLoggedIn && (
              <NavItem>
                <NavLink to="/dashboard" $active={isActive("/dashboard")}>
                  Dashboard
                </NavLink>
              </NavItem>
            )}
            <NavItem>
              <NavLink to="/upload" $active={isActive("/upload")}>
                Upload
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/search" $active={isActive("/search")}>
                Search
              </NavLink>
            </NavItem>
            <NavItem>
              <ExternalLink
                href="https://fairscape.github.io/fairscape-cli/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Documentation
              </ExternalLink>
            </NavItem>
            {!isLoggedIn && (
              <NavItem>
                <NavLink to="/login" $active={isActive("/login")}>
                  Login
                </NavLink>
              </NavItem>
            )}
            {isLoggedIn && <UserProfile onLogout={handleShowLogoutAlert} />}
          </NavLinks>
        </Navbar>
      </StyledHeader>
      {showLogoutAlert && (
        <div>
          <div>
            <button onClick={handleCloseAlert}>×</button>
            <p>{logoutMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
