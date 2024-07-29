import React from "react";
import LoginComponent from "./LoginComponent";
import {
  Sidebar,
  SidebarContent,
  SidebarItem,
  SidebarFooter,
  SidebarSubItem,
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
  onQuestionnaireSelect,
  expanded,
  toggleSidebar,
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
        <SidebarItem
          onClick={onQuestionnaireSelect}
          active={selectedCommand === ""}
        >
          Steps
        </SidebarItem>
        <SidebarItem onClick={toggleSidebar}>
          Commands {expanded ? "▼" : "▶"}
        </SidebarItem>
        {expanded &&
          Object.keys(commands).map((command) => (
            <SidebarSubItem
              key={command}
              active={selectedCommand === command}
              onClick={() => handleCommandSelect(command)}
            >
              {command}
            </SidebarSubItem>
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
