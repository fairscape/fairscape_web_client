// src/components/MetadataDisplay/TabsSection.tsx
import React, { useState } from "react";
import styled from "styled-components";

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 3px solid
    ${({ active, theme }) => (active ? theme.colors.primary : "transparent")};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

const Badge = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  margin-left: 5px;
`;

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
