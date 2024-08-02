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
  selectedView,
  handleViewSelect,
  isLoggedIn,
  userData,
  onLogin,
}) {
  const steps = [
    { id: "init", label: "1: Init" },
    { id: "register", label: "2: Register" },
    { id: "package", label: "3: Package" },
    { id: "upload", label: "4: Upload" },
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
