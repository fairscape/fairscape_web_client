import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";
import axios from "axios";
import SidebarComponent from "./components/Sidebar";
import Questionnaire from "./components/Questionnaire";
import MainContentComponent from "./components/MainContent";
import { AppContainer, MainContent } from "./components/StyledComponents";
import commandsData from "./data/commandsData";
import {
  rocrate_init,
  rocrate_create,
  register_software,
  register_dataset,
  register_computation,
  add_software,
  add_dataset,
} from "./rocrate/rocrate";

function App() {
  const archiver = require("archiver");
  const [commandState, setCommandState] = useState({
    command: "",
    subCommand: "",
    subSubCommand: "",
  });
  const [options, setOptions] = useState({});
  const [output, setOutput] = useState("");
  const [rocratePath, setRocratePath] = useState("");
  const [schemaFile, setSchemaFile] = useState("");
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
    // This effect will run whenever commandState changes
    // You can put any logic here that needs to happen after both command and subcommand are updated
    // For example, you might want to reset options or fetch new data based on the new command/subcommand
  }, [commandState]);

  const handleCommandSelect = (command) => {
    setCommandState({
      command: command,
      subCommand: "",
      subSubCommand: "",
    });
    setOptions({});
    setRocratePath("");
    setSchemaFile("");
    setShowQuestionnaire(false);

    const subCommands = Object.keys(commandsData[command] || {});
    if (subCommands.length === 1) {
      handleSubCommandSelect(subCommands[0]);
    }
    if (command === "3: Package") {
      handleSubCommandSelect("zip");
    }
  };

  const handleSubCommandSelect = (subCommand) => {
    setCommandState((prevState) => ({
      ...prevState,
      subCommand: subCommand,
      subSubCommand: "",
    }));
    setOptions({});

    if (commandState.command === "3: Package") {
      setCommandState((prevState) => ({
        ...prevState,
        subSubCommand: "zip",
      }));
      return;
    }
    const subSubCommands = Object.keys(
      (commandsData[commandState.command] || {})[subCommand] || {}
    );
    console.log("Available sub-subcommands:", subSubCommands);
    if (subSubCommands.length === 1) {
      handleSubSubCommandSelect(subSubCommands[0]);
    }
  };

  const handleSubSubCommandSelect = (subSubCommand) => {
    setCommandState((prevState) => ({
      ...prevState,
      subSubCommand: subSubCommand,
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
      subSubCommand: "",
    });
  };

  const handleStepSelect = (action) => {
    setCommandState({
      command: action.command,
      subCommand: action.subCommand || "",
      subSubCommand: action.subsubCommand || "",
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

  const handleSchemaFileChange = (e) => {
    setSchemaFile(e.target.value);
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
      switch (
        `${commandState.command}_${commandState.subCommand}_${commandState.subSubCommand}`
      ) {
        case "1: Create_create_create":
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
        case "2: Add_register_software":
          result = register_software(
            rocratePath,
            options.name,
            options.author,
            options.version,
            options.description,
            options.keywords,
            options["file_format"],
            options.guid,
            options.url,
            options["date-modified"],
            options["source-filepath"],
            options["used-by-computation"],
            options["associated-publication"],
            options["additional-documentation"]
          );
          break;
        case "2: Add_register_dataset":
          result = register_dataset(
            rocratePath,
            options.name,
            options.author,
            options.version,
            options["date-published"],
            options.description,
            options.keywords,
            options.data_format,
            options["source-filepath"],
            options.guid,
            options.url,
            options["used-by"],
            options["derived-from"],
            options.schema,
            options["associated-publication"],
            options["additional-documentation"]
          );
          break;
        case "2: Add_register_computation":
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
        case "2: Add_add_software":
          result = add_software(
            rocratePath,
            options.name,
            options.author,
            options.version,
            options.description,
            options.keywords,
            options["file-format"],
            options["source-filepath"],
            options["destination-filepath"],
            options["date-modified"],
            options.guid,
            options.url,
            options["used-by-computation"],
            options["associated-publication"],
            options["additional-documentation"]
          );
          break;
        case "2: Add_add_dataset":
          result = add_dataset(
            rocratePath,
            options.name,
            options.author,
            options.version,
            options.date_published,
            options.description,
            options.keywords,
            options.data_format,
            options["source-filepath"],
            options["destination-filepath"],
            options.guid,
            options.url,
            options["used-by"],
            options["derived-from"],
            options.schema,
            options.associated_publication,
            options.additional_documentation
          );
          break;
        default:
          throw new Error("Invalid command combination");
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
    let currentOptions = commandsData[commandState.command];
    if (commandState.subCommand && currentOptions) {
      currentOptions = currentOptions[commandState.subCommand];
    }
    if (commandState.subSubCommand && currentOptions) {
      currentOptions = currentOptions[commandState.subSubCommand];
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
      commandState.command !== "rocrate" ||
      (rocratePath && rocratePath.trim() !== "");

    const schemaFileFilled =
      commandState.command !== "schema" ||
      (schemaFile && schemaFile.trim() !== "");

    return !(requiredFieldsFilled && rocratePathFilled && schemaFileFilled);
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
      case "1: Create":
        setCommandState({
          command: "2: Add",
          subCommand: "add",
          subSubCommand: "dataset",
        });
        break;
      case "2: Add":
        setCommandState({
          command: "3: Package",
          subCommand: "zip",
          subSubCommand: "zip",
        });
        break;
      case "3: Package":
        setCommandState({
          command: "4: Upload",
          subCommand: "rocrate",
          subSubCommand: "rocrate",
        });
        break;
      default:
        // Do nothing or reset to initial state
        break;
    }
  };

  const onAddAnother = () => {
    // Reset options state
    setOptions({});

    // Reset specific fields while keeping others (like rocratePath) intact
    setCommandState((prevState) => ({
      ...prevState,
      subSubCommand: "", // Reset sub-sub-command if applicable
    }));

    // You may want to keep some fields, like rocratePath, unchanged
    // setRocratePath(""); // Uncomment if you want to reset rocratePath

    // Reset source file path in CommandForm
    // You might need to pass this down as a prop or use a ref
    // setSourceFilePath("");

    // Optionally scroll to the top of the form
    window.scrollTo(0, 0);

    // Optionally show a success message
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
            selectedSubSubCommand={commandState.subSubCommand}
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
            onSuccessfulExecution={handleSuccessfulExecution}
            onAddAnother={onAddAnother}
          />
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
