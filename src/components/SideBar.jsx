import React from "react";
import LoginComponent from "./LoginComponent";
import {
  Sidebar,
  SidebarContent,
  SidebarItem,
  SidebarFooter,
} from "./StyledComponents";

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
        <h3 style={{ marginBottom: "20px", color: accentColor }}>
          FAIRSCAPE ROCrate Repository
        </h3>
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
