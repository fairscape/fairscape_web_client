import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import axios from "axios";
import SidebarComponent from "./components/Sidebar";
import MainContentComponent from "./components/MainContent";
import { AppContainer } from "./components/StyledComponents";
import commandsData from "./data/commandsData";

function App() {
  const archiver = require("archiver");
  const [selectedCommand, setSelectedCommand] = useState("");
  const [selectedSubCommand, setSelectedSubCommand] = useState("");
  const [selectedSubSubCommand, setSelectedSubSubCommand] = useState("");
  const [options, setOptions] = useState({});
  const [output, setOutput] = useState("");
  const [rocratePath, setRocratePath] = useState("");
  const [schemaFile, setSchemaFile] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [previousPaths, setPreviousPaths] = useState([]);

  useEffect(() => {
    const storedPaths = JSON.parse(localStorage.getItem("previousPaths")) || [];
    setPreviousPaths(storedPaths);
  }, []);

  const handleCommandSelect = (command) => {
    setSelectedCommand(command);
    setSelectedSubCommand("");
    setSelectedSubSubCommand("");
    setOptions({});
    setRocratePath("");
    setSchemaFile("");

    const subCommands = Object.keys(commandsData[command] || {});
    if (subCommands.length === 1) {
      handleSubCommandSelect(subCommands[0]);
    }
    if (command === "zip") {
      handleSubCommandSelect("zip");
    }
  };

  const handleSubCommandSelect = (subCommand) => {
    setSelectedSubCommand(subCommand);
    setSelectedSubSubCommand("");
    setOptions({});

    if (selectedCommand === "zip") {
      setSelectedSubSubCommand("zip");
      return;
    }
    const subSubCommands = Object.keys(
      (commandsData[selectedCommand] || {})[subCommand] || {}
    );
    console.log("Available sub-subcommands:", subSubCommands);
    if (subSubCommands.length === 1) {
      handleSubSubCommandSelect(subSubCommands[0]);
    }
  };

  const handleSubSubCommandSelect = (subSubCommand) => {
    setSelectedSubSubCommand(subSubCommand);
    setOptions({});
  };

  const handleOptionChange = (option, value) => {
    setOptions({ ...options, [option]: value });
  };

  const handleRocratePathChange = (e) => {
    const newPath = e.target.value;
    setRocratePath(newPath);

    if (newPath && !previousPaths.includes(newPath)) {
      const updatedPaths = [newPath, ...previousPaths.slice(0, 4)]; // Keep only the last 5 paths
      setPreviousPaths(updatedPaths);
      localStorage.setItem("previousPaths", JSON.stringify(updatedPaths));
    }
  };

  const handleSchemaFileChange = (e) => {
    setSchemaFile(e.target.value);
  };

  const handleZip = (e) => {
    e.preventDefault();
    const path = options.path;
    if (!path) {
      setOutput("Error: Path is required for zipping.");
      return;
    }

    ipcRenderer.send("zip-rocrate", path);

    ipcRenderer.once("zip-result", (event, result) => {
      if (result.success) {
        setOutput(`RO-Crate successfully zipped at: ${result.zipPath}`);
      } else {
        setOutput(`Error zipping RO-Crate: ${result.error}`);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCommand === "zip") {
      handleZip(e);
      return;
    }

    let command = `fairscape-cli ${selectedCommand} ${selectedSubCommand}`;
    if (selectedSubSubCommand && selectedSubSubCommand !== selectedSubCommand) {
      command += ` ${selectedSubSubCommand}`;
    }

    Object.entries(options).forEach(([key, value]) => {
      if (value) {
        command += ` --${key} "${value}"`;
      }
    });

    if (selectedCommand === "rocrate") {
      command += ` "${rocratePath}"`;
    }

    if (selectedCommand === "schema") {
      command += ` "${schemaFile}"`;
    }

    ipcRenderer.send("execute-command", command);

    ipcRenderer.once("command-result", (event, result) => {
      setOutput(result);
    });
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
        `http://fairscape.net/${selectedSubCommand}/upload`
      );
      console.log("Form data:", Object.fromEntries(formData));

      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `http://fairscape.net/${selectedSubCommand}/upload`,
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
    } catch (error) {
      console.error("Upload error:", error);
      setOutput(
        `Error: ${error.message}\n\nResponse data: ${JSON.stringify(
          error.response?.data,
          null,
          2
        )}`
      );
    } finally {
      console.log("Upload attempt completed");
    }
  };

  const isExecuteDisabled = () => {
    let currentOptions = commandsData[selectedCommand];
    if (selectedSubCommand && currentOptions) {
      currentOptions = currentOptions[selectedSubCommand];
    }
    if (selectedSubSubCommand && currentOptions) {
      currentOptions = currentOptions[selectedSubSubCommand];
    }

    if (!currentOptions || !currentOptions.required) {
      return true;
    }

    const requiredFieldsFilled = currentOptions.required.every((option) => {
      const value = options[option];
      if (value instanceof File) {
        return true;
      } else if (typeof value === "string") {
        return value.trim() !== "";
      }
      return false;
    });

    const rocratePathFilled =
      selectedCommand !== "rocrate" ||
      (rocratePath && rocratePath.trim() !== "");

    const schemaFileFilled =
      selectedCommand !== "schema" || (schemaFile && schemaFile.trim() !== "");

    return !(requiredFieldsFilled && rocratePathFilled && schemaFileFilled);
  };

  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserData(data);
  };

  return (
    <AppContainer>
      <SidebarComponent
        commands={commandsData}
        selectedCommand={selectedCommand}
        handleCommandSelect={handleCommandSelect}
        isLoggedIn={isLoggedIn}
        userData={userData}
        onLogin={handleLogin}
      />
      <MainContentComponent
        commands={commandsData}
        selectedCommand={selectedCommand}
        selectedSubCommand={selectedSubCommand}
        selectedSubSubCommand={selectedSubSubCommand}
        options={options}
        output={output}
        rocratePath={rocratePath}
        schemaFile={schemaFile}
        handleSubCommandSelect={handleSubCommandSelect}
        handleSubSubCommandSelect={handleSubSubCommandSelect}
        handleOptionChange={handleOptionChange}
        handleRocratePathChange={handleRocratePathChange}
        handleSchemaFileChange={handleSchemaFileChange}
        handleSubmit={handleSubmit}
        handleUpload={handleUpload}
        isExecuteDisabled={isExecuteDisabled}
        previousPaths={previousPaths}
      />
    </AppContainer>
  );
}

export default App;
