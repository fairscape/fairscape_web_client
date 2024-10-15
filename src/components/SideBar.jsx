import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";
import LoginComponent from "./LoginComponent";
import {
  Sidebar,
  SidebarContent,
  SidebarItem,
  SidebarFooter,
} from "./StyledComponents";
import logoSvg from "../assets/logo.svg";

const accentColor = "#007bff";
const accentColorHover = "#0056b3";

const UserProfileContainer = styled.div`
  position: relative;
  width: 100%;
`;

const UserCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${accentColor};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${accentColorHover};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #282828;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 15px;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
`;

const UserInfo = styled.p`
  margin: 5px 0;
  color: #fff;
  font-size: 14px;
  word-break: break-word;
`;

const LogoutButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;
  width: 100%;

  &:hover {
    background-color: #c82333;
  }
`;

function SidebarComponent({
  selectedView,
  handleViewSelect,
  isLoggedIn,
  userData,
  onLogin,
  onLogout,
}) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isLoggedIn && userData) {
      decodeUserToken();
    }
  }, [isLoggedIn, userData]);

  const decodeUserToken = () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        setUser({
          givenName: decodedToken.name.split(" ")[0],
          surname: decodedToken.name.split(" ")[1],
          email: decodedToken.email,
          organization: decodedToken.iss
            ? decodedToken.iss.replace("https://", "").replace("/", "")
            : "Unknown",
        });
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      handleLogout();
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    onLogout();
    setDropdownVisible(false);
  };

  const steps = [
    { id: "init", label: "1: Init" },
    { id: "register", label: "2: Register" },
    { id: "review", label: "3: Review" },
    { id: "package", label: "4: Package" },
    { id: "upload", label: "5: Upload" },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <img
            src={logoSvg}
            alt="FAIRSCAPE ROCrate Repository"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
        <SidebarItem
          onClick={() => handleViewSelect("questionnaire")}
          active={selectedView === "questionnaire"}
        >
          Steps
        </SidebarItem>
        {steps.map((step) => (
          <SidebarItem
            key={step.id}
            onClick={() => handleViewSelect(step.id)}
            active={selectedView === step.id}
          >
            {step.label}
          </SidebarItem>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {isLoggedIn && user ? (
          <UserProfileContainer>
            {dropdownVisible && (
              <DropdownMenu>
                <UserInfo>
                  <strong>Name:</strong> {user.givenName} {user.surname}
                </UserInfo>
                <UserInfo>
                  <strong>Email:</strong> {user.email}
                </UserInfo>
                <UserInfo>
                  <strong>Organization:</strong> {user.organization}
                </UserInfo>
                <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>
              </DropdownMenu>
            )}
            <UserCircle onClick={toggleDropdown}>
              {user.givenName.charAt(0)}
            </UserCircle>
          </UserProfileContainer>
        ) : (
          <LoginComponent onLogin={onLogin} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default SidebarComponent;
