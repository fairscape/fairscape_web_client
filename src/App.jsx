import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import axios from "axios";
import SidebarComponent from "./components/Sidebar";
import Questionnaire from "./components/Questionnaire";
import MainContentComponent from "./components/MainContent";
import { AppContainer, MainContent } from "./components/StyledComponents";
import commandsData from "./data/commandsData";
import {
  rocrate_create,
  register_software,
  register_dataset,
  register_computation,
} from "./rocrate/rocrate";

function App() {
  const [commandState, setCommandState] = useState({
    command: "",
    subCommand: "",
  });
  const [options, setOptions] = useState({});
  const [output, setOutput] = useState("");
  const [rocratePath, setRocratePath] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [previousPaths, setPreviousPaths] = useState([]);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const storedPaths = JSON.parse(localStorage.getItem("previousPaths")) || [];
    setPreviousPaths(storedPaths);
  }, []);

  useEffect(() => {
    if (commandState.command && commandsData[commandState.command]) {
      const subCommands = Object.keys(commandsData[commandState.command]);
      if (subCommands.length === 1) {
        setCommandState((prevState) => ({
          ...prevState,
          subCommand: subCommands[0],
        }));
      }
    }
  }, [commandState.command]);

  const handleCommandSelect = (command) => {
    setCommandState({
      command: command,
      subCommand: "",
    });
    setOptions({});
    setRocratePath("");
    setShowQuestionnaire(false);

    // Automatically select the subCommand if there's only one
    const subCommands = Object.keys(commandsData[command]).filter(
      (key) => key !== "description"
    );
    if (subCommands.length === 1) {
      handleSubCommandSelect(subCommands[0]);
    }
  };

  const handleSubCommandSelect = (subCommand) => {
    setCommandState((prevState) => ({
      ...prevState,
      subCommand: subCommand,
    }));
    setOptions({});
  };

  const handleOptionChange = (option, value) => {
    setOptions({ ...options, [option]: value });
  };

  const handleQuestionnaireSelect = () => {
    setShowQuestionnaire(true);
    setCommandState({
      command: "",
      subCommand: "",
    });
  };

  const handleStepSelect = (action) => {
    setCommandState({
      command: action.command,
      subCommand: action.subCommand || "",
    });
    setShowQuestionnaire(false);
  };

  const handleRocratePathChange = (e) => {
    const newPath = e.target.value;
    setRocratePath(newPath);

    if (newPath && !previousPaths.includes(newPath)) {
      const updatedPaths = [newPath, ...previousPaths.slice(0, 4)];
      setPreviousPaths(updatedPaths);
      localStorage.setItem("previousPaths", JSON.stringify(updatedPaths));
    }
  };

  const handleZip = (e) => {
    e.preventDefault();
    const path = options.path;
    if (!path) {
      setOutput("Error: Path is required for zipping.");
      return { success: false };
    }

    ipcRenderer.send("zip-rocrate", path);

    return new Promise((resolve) => {
      ipcRenderer.once("zip-result", (event, result) => {
        if (result.success) {
          setOutput(`RO-Crate successfully zipped at: ${result.zipPath}`);
          resolve({ success: true });
        } else {
          setOutput(`Error zipping RO-Crate: ${result.error}`);
          resolve({ success: false });
        }
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (commandState.command === "3: Package") {
      return handleZip(e);
    }

    let result;
    try {
      switch (commandState.command) {
        case "1: Init":
          result = rocrate_create(
            rocratePath,
            options.name,
            options.organization_name,
            options.project_name,
            options.description,
            options.keywords,
            options.guid
          );
          break;
        case "2: Register":
          switch (commandState.subCommand) {
            case "software":
              result = register_software(
                rocratePath,
                options.name,
                options.author,
                options.version,
                options.description,
                options.keywords,
                options["file-format"],
                options.guid,
                options.url,
                options["date-modified"],
                options["filepath"],
                options["used-by-computation"],
                options["associated-publication"],
                options["additional-documentation"]
              );
              break;
            case "dataset":
              result = register_dataset(
                rocratePath,
                options.name,
                options.author,
                options.version,
                options["date-published"],
                options.description,
                options.keywords,
                options.data_format,
                options["filepath"],
                options.guid,
                options.url,
                options["used-by"],
                options["derived-from"],
                options.schema,
                options["associated-publication"],
                options["additional-documentation"]
              );
              break;
            case "computation":
              result = register_computation(
                rocratePath,
                options.name,
                options["run-by"],
                options["date-created"],
                options.description,
                options.keywords,
                options.guid,
                options.command,
                options["used-software"],
                options["used-dataset"],
                options.generated
              );
              break;
            default:
              throw new Error("Invalid sub-command");
          }
          break;
        default:
          throw new Error("Invalid command");
      }
      setOutput(JSON.stringify(result, null, 2));
      return { success: true };
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      return { success: false };
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setOutput("Starting upload...");

    const formData = new FormData();

    Object.entries(options).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, value);
      }
    });

    try {
      console.log(
        "Sending request to:",
        `http://fairscape.net/${commandState.subCommand}/upload`
      );
      console.log("Form data:", Object.fromEntries(formData));

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `http://fairscape.net/${commandState.subCommand}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setOutput(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      console.log("Response received:", response);
      setOutput(JSON.stringify(response.data, null, 2));
      return { success: true };
    } catch (error) {
      console.error("Upload error:", error);
      setOutput(
        `Error: ${error.message}\n\nResponse data: ${JSON.stringify(
          error.response?.data,
          null,
          2
        )}`
      );
      return { success: false };
    }
  };

  const isExecuteDisabled = () => {
    const currentCommand = commandsData[commandState.command];
    if (!currentCommand) return true;

    const currentSubCommand = currentCommand[commandState.subCommand];
    if (!currentSubCommand || !currentSubCommand.required) return true;

    const requiredFieldsFilled = currentSubCommand.required.every((option) => {
      const value = options[option];
      if (value instanceof File) {
        return true;
      } else if (typeof value === "string") {
        return value.trim() !== "";
      }
      return false;
    });

    const rocratePathFilled =
      commandState.command !== "4: Upload" ||
      (rocratePath && rocratePath.trim() !== "");

    return !(requiredFieldsFilled && rocratePathFilled);
  };

  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserData(data);
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSuccessfulExecution = (command) => {
    switch (command) {
      case "1: Init":
        setCommandState({
          command: "2: Register",
        });
        break;
      case "2: Register":
        setCommandState({
          command: "3: Package",
          subCommand: "zip",
        });
        break;
      case "3: Package":
        setCommandState({
          command: "4: Upload",
          subCommand: "rocrate",
        });
        break;
      default:
        // Do nothing or reset to initial state
        break;
    }
  };

  const onAddAnother = () => {
    setOptions({});
    setCommandState((prevState) => ({
      ...prevState,
      subCommand: "", // Reset sub-command if applicable
    }));
    window.scrollTo(0, 0);
    setOutput("Item added successfully. You can now add another.");
  };

  return (
    <AppContainer>
      <SidebarComponent
        commands={commandsData}
        selectedCommand={commandState.command}
        handleCommandSelect={handleCommandSelect}
        isLoggedIn={isLoggedIn}
        userData={userData}
        onLogin={handleLogin}
        onQuestionnaireSelect={handleQuestionnaireSelect}
        expanded={sidebarExpanded}
        toggleSidebar={toggleSidebar}
      />
      <MainContent>
        {showQuestionnaire ? (
          <Questionnaire onStepSelect={handleStepSelect} />
        ) : (
          <MainContentComponent
            commands={commandsData}
            selectedCommand={commandState.command}
            selectedSubCommand={commandState.subCommand}
            options={options}
            output={output}
            rocratePath={rocratePath}
            handleSubCommandSelect={handleSubCommandSelect}
            handleOptionChange={handleOptionChange}
            handleRocratePathChange={handleRocratePathChange}
            handleSubmit={handleSubmit}
            handleUpload={handleUpload}
            isExecuteDisabled={isExecuteDisabled}
            previousPaths={previousPaths}
            onSuccessfulExecution={handleSuccessfulExecution}
            onAddAnother={onAddAnother}
          />
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
