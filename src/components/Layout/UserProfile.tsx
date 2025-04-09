// src/components/Layout/UserProfile.tsx
import React, { useState, useEffect, useContext, useRef } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext"; // Adjust path
import { User } from "../../types"; // Adjust path
// Import icons if needed (e.g., from lucide-react)
// import { LogOut, Settings } from 'lucide-react';

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const ProfileContainer = styled.div`
  position: relative;
`;

const UserCircle = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: ${({ theme }) => theme.spacing.md};
  width: 280px;
  z-index: 100;
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
  border-radius: 4px;
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
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.error}1A; // Light red background
  }
`;

interface UserProfileProps {
  onLogout: (message: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const authContext = useContext(AuthContext);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Basic error check for context
  if (!authContext) {
    console.error("AuthContext not available in UserProfile");
    return null; // Or some fallback UI
  }
  const { logout } = authContext;

  // --- Token Validation and User Fetching Logic (Adapted from original) ---
  const validateTokenAndDecodeUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout("Your session has expired. Please log in again.");
        return;
      }

      // Optional: Add a quick local expiry check first
      // const expiry = localStorage.getItem("tokenExpiry");
      // if (expiry && new Date(expiry) <= new Date()) {
      //     handleLogout("Your session has expired. Please log in again.");
      //     return;
      // }

      // Simple validation check against an endpoint (replace /rocrate if needed)
      const response = await fetch(`${API_URL}/rocrate`, {
        // Or a dedicated /profile/validate endpoint
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        handleLogout("Your session has expired. Please log in again.");
        return;
      }
      if (!response.ok) {
        // Handle other errors if needed, maybe just log them
        console.error("Token validation failed with status:", response.status);
        // Decide if logout is needed for non-401 errors
        // handleLogout("Session validation failed. Please log in again.");
        // return;
      }

      // If validation passes, decode the token
      const decodedToken: any = jwtDecode(token); // Use 'any' or define a proper DecodedToken interface
      setUser({
        givenName: decodedToken.name?.split(" ")[0] || "User",
        surname: decodedToken.name?.split(" ")[1] || "",
        email: decodedToken.email || "N/A",
        organization:
          decodedToken.iss?.replace("https://", "").replace("/", "") || "N/A",
      });
    } catch (error) {
      console.error("Error validating token:", error);
      handleLogout("An error occurred with your session. Please log in again.");
    }
  };

  useEffect(() => {
    validateTokenAndDecodeUser();
    // Optional: Refresh periodically (consider security implications)
    // const intervalId = setInterval(validateTokenAndDecodeUser, 5 * 60 * 1000); // every 5 mins
    // return () => clearInterval(intervalId);
  }, []); // Run only on mount

  // --- Click Outside Handler ---
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
  // --- End Click Outside ---

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

  const handleLogout = (message: string) => {
    setUser(null);
    setDropdownVisible(false);
    logout(); // Call context logout
    onLogout(message); // Show alert via prop callback
  };

  const handleUserLogoutClick = () => {
    handleLogout("You have been logged out successfully.");
  };

  if (!user) return null; // Don't render if user data not loaded yet

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
            {/* <Settings size={18} />  */}
            Manage Tokens
          </DropdownLink>
          <LogoutButton onClick={handleUserLogoutClick}>
            {/* <LogOut size={18} /> */}
            Log Out
          </LogoutButton>
        </DropdownMenu>
      )}
    </ProfileContainer>
  );
};

export default UserProfile;
