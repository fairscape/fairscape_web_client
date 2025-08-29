import styled from "styled-components";

export const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

export const Tab = styled.div<{ active: boolean }>`
  padding: 10px 15px;
  cursor: pointer;
  border-bottom: 3px solid
    ${({ active, theme }) => (active ? theme.colors.primary : "transparent")};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
`;

export const Badge = styled.span`
  display: inline-block;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  margin-left: 5px;
`;
