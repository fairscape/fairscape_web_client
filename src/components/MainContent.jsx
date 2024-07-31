import React from "react";
import { Row, Col } from "react-bootstrap";
import CommandForm from "./CommandForm";
import OutputBoxComponent from "./OutputBox";
import {
  StyledContainer,
  ScrollableRow,
  SidebarCol,
  ContentCol,
  SidebarItem,
  StyledOutputBox,
} from "./StyledComponents";

function MainContentComponent({
  commands,
  selectedCommand,
  selectedSubCommand,
  options,
  output,
  rocratePath,
  handleSubCommandSelect,
  handleOptionChange,
  handleRocratePathChange,
  handleSubmit,
  handleUpload,
  isExecuteDisabled,
  previousPaths,
  onSuccessfulExecution,
  onAddAnother,
}) {
  const getDescription = () => {
    if (selectedCommand && commands[selectedCommand]) {
      const commandObj = commands[selectedCommand];
      if (selectedSubCommand && commandObj[selectedSubCommand]) {
        return (
          commandObj[selectedSubCommand].description ||
          "No description available."
        );
      }
      return commandObj.description || "No description available.";
    }
    return "Please select a command to see its description.";
  };

  const getSubCommands = () => {
    if (selectedCommand && commands[selectedCommand]) {
      return Object.keys(commands[selectedCommand]).filter(
        (key) => key !== "description"
      );
    }
    return [];
  };

  return (
    <StyledContainer fluid>
      <Row>
        <Col>
          <h4>{selectedCommand}</h4>
          <p>{getDescription()}</p>
        </Col>
      </Row>
      <ScrollableRow>
        <SidebarCol md={3}>
          {selectedCommand && (
            <div>
              {getSubCommands().map((subCommand) => (
                <SidebarItem
                  key={subCommand}
                  active={selectedSubCommand === subCommand}
                  onClick={() => handleSubCommandSelect(subCommand)}
                >
                  {subCommand}
                </SidebarItem>
              ))}
            </div>
          )}
        </SidebarCol>
        <ContentCol md={9}>
          {selectedSubCommand && (
            <CommandForm
              commands={commands}
              selectedCommand={selectedCommand}
              selectedSubCommand={selectedSubCommand}
              options={options}
              rocratePath={rocratePath}
              handleOptionChange={handleOptionChange}
              handleRocratePathChange={handleRocratePathChange}
              handleSubmit={handleSubmit}
              handleUpload={handleUpload}
              isExecuteDisabled={isExecuteDisabled}
              previousPaths={previousPaths}
              onSuccessfulExecution={onSuccessfulExecution}
              onAddAnother={onAddAnother}
            />
          )}
          <StyledOutputBox>
            <OutputBoxComponent output={output} />
          </StyledOutputBox>
        </ContentCol>
      </ScrollableRow>
    </StyledContainer>
  );
}

export default MainContentComponent;
