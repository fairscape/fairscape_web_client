import React, { useState, useEffect, useContext, useRef } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import { User, DecodedToken } from "../../types";
import { theme } from "../../styles/theme";

const ProfileContainer = styled.div`
  position: relative;
`;

const UserCircle = styled.button`
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.primaryTint};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 13px;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  cursor: pointer;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-color: ${({ theme }) => theme.colors.borderStrong};
  padding: ${({ theme }) => theme.spacing.md};
  width: 280px;
  max-width: calc(100vw - 32px);
  z-index: 100;

  @media (max-width: 768px) {
    left: 0;
    right: auto;
  }
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const UserInfo = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  strong {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const DropdownLink = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: left;
  width: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.error}1A; // Light red background
  }
`;

interface UserProfileProps {
  onLogout: (message: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("UserProfile must be used within an AuthProvider");
  }

  const { isLoggedIn, token, logout } = authContext;

  useEffect(() => {
    if (isLoggedIn && token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUser({
          givenName: decoded.name?.split(" ")[0] || "User",
          surname: decoded.name?.split(" ")[1] || "",
          email: decoded.email || "N/A",
          organization:
            decoded.iss?.replace("https://", "").replace("/", "") || "N/A",
        });
      } catch (error) {
        console.error("Failed to decode JWT:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [isLoggedIn, token]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const handleLogoutClick = () => {
    setDropdownVisible(false);
    logout();
    onLogout("You have been logged out successfully.");
  };

  if (!user) {
    return null;
  }

  return (
    <ProfileContainer ref={dropdownRef}>
      <UserCircle onClick={toggleDropdown} aria-label="User Profile">
        {user.givenName.charAt(0).toUpperCase()}
      </UserCircle>
      {dropdownVisible && (
        <DropdownMenu>
          <UserInfo>
            <strong>Name:</strong> {user.givenName} {user.surname}
          </UserInfo>
          <UserInfo>
            <strong>Email:</strong> {user.email}
          </UserInfo>
          <UserInfo>
            <strong>Org:</strong> {user.organization}
          </UserInfo>
          <hr
            style={{
              border: "none",
              borderTop: `1px solid ${theme.colors.border}`,
              margin: `${theme.spacing.sm} 0`,
            }}
          />
          <DropdownLink to="/tokens" onClick={() => setDropdownVisible(false)}>
            Manage Tokens
          </DropdownLink>
          <LogoutButton onClick={handleLogoutClick}>Log Out</LogoutButton>
        </DropdownMenu>
      )}
    </ProfileContainer>
  );
};

export default UserProfile;
