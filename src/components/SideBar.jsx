import React from "react";
import LoginComponent from "./LoginComponent";
import {
  Sidebar,
  SidebarContent,
  SidebarItem,
  SidebarFooter,
} from "./StyledComponents";
import logoSvg from "../assets/logo.svg";

const accentColor = "#007bff";

function SidebarComponent({
  commands,
  selectedCommand,
  handleCommandSelect,
  isLoggedIn,
  userData,
  onLogin,
}) {
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
        {Object.keys(commands).map((command) => (
          <SidebarItem
            key={command}
            active={selectedCommand === command}
            onClick={() => handleCommandSelect(command)}
          >
            {command}
          </SidebarItem>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {isLoggedIn ? (
          <p style={{ color: accentColor }}>Welcome, {userData.username}!</p>
        ) : (
          <LoginComponent onLogin={onLogin} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default SidebarComponent;
