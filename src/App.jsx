import React, { useState } from "react";
import InitForm from "./components/InitForm";
import FileSelector from "./components/Register/FileSelector";
import ComputationForm from "./components/Register/ComputationForm";
import PackageForm from "./components/PackageForm";
import UploadForm from "./components/UploadForm";
import SidebarComponent from "./components/Sidebar";
import Questionnaire from "./components/Questionnaire";
import {
  AppContainer,
  MainContentWrapper,
} from "./components/StyledComponents";

function App() {
  const [currentView, setCurrentView] = useState("questionnaire");
  const [rocratePath, setRocratePath] = useState("");
  const [packagedPath, setPackagedPath] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [registeredFiles, setRegisteredFiles] = useState([]);

  const handleViewSelect = (view) => {
    setCurrentView(view);
  };

  const handleInitSuccess = () => {
    setCurrentView("register");
  };

  const handleDoneRegistering = () => {
    setCurrentView("computation");
  };

  const handleSkipComputation = () => {
    setCurrentView("package");
  };

  const handlePackageComplete = (zipPath) => {
    setPackagedPath(zipPath);
    setCurrentView("upload");
  };

  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserData(data);
  };

  const handleFileRegister = (newFiles) => {
    setRegisteredFiles([...registeredFiles, ...newFiles]);
  };

  const renderMainContent = () => {
    switch (currentView) {
      case "questionnaire":
        return <Questionnaire onStepSelect={handleViewSelect} />;
      case "init":
        return (
          <InitForm
            rocratePath={rocratePath}
            setRocratePath={setRocratePath}
            onSuccess={handleInitSuccess}
          />
        );
      case "register":
        return (
          <FileSelector
            rocratePath={rocratePath}
            setRocratePath={setRocratePath}
            onDoneRegistering={handleDoneRegistering}
            onFileRegister={handleInitSuccess}
          />
        );
      case "computation":
        return (
          <ComputationForm
            rocratePath={rocratePath}
            registeredFiles={registeredFiles}
            onComplete={handleFileRegister}
            onSkip={handleSkipComputation}
          />
        );
      case "package":
        return (
          <PackageForm
            rocratePath={rocratePath}
            setRocratePath={setRocratePath}
            onComplete={handlePackageComplete}
          />
        );
      case "upload":
        return <UploadForm packagedPath={packagedPath} />;
      default:
        return <div>Select a step from the sidebar</div>;
    }
  };

  return (
    <AppContainer>
      <SidebarComponent
        selectedView={currentView}
        handleViewSelect={handleViewSelect}
        isLoggedIn={isLoggedIn}
        userData={userData}
        onLogin={handleLogin}
      />
      <MainContentWrapper>{renderMainContent()}</MainContentWrapper>
    </AppContainer>
  );
}

export default App;
