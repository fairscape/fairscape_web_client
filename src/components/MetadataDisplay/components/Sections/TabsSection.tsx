import React from "react";

import { TabsContainer, Tab, Badge } from "./TabsSection.styles";

export interface TabConfig {
  id: string;
  label: string;
  count: number;
}

interface TabsSectionProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const TabsSection: React.FC<TabsSectionProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <TabsContainer>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label} <Badge>{tab.count}</Badge>
        </Tab>
      ))}
    </TabsContainer>
  );
};

export default TabsSection;
