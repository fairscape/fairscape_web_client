import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const NodeContainer = styled.div<{ level: number }>`
  padding-left: ${({ level }) => level * 16}px;
`;

const NodeHeader = styled.div<{ clickable?: boolean }>`
  display: flex;
  align-items: center;
  padding: 2px 4px;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  transition: background-color 0.1s;
  user-select: none;
  height: 22px;

  &:hover {
    background-color: ${({ theme, clickable }) =>
      clickable ? "rgba(90, 93, 94, 0.31)" : "transparent"};
  }
`;

const ExpandIcon = styled.span<{ visible: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 2px;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text};
  visibility: ${({ visible }) => (visible ? "visible" : "hidden")};
`;

const FolderIcon = styled.span<{ isOpen: boolean; isFolder: boolean }>`
  margin-right: 6px;
  font-size: 16px;
  line-height: 1;
  ${({ isFolder, isOpen }) => {
    if (!isFolder) return "";
    return isOpen ? "" : "filter: brightness(0.9);";
  }}
`;

const NodeContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const NodeLabelRow = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const NodeLabel = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NodeLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Description = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary || "#858585"};
  font-size: 12px;
  margin-top: 2px;
  margin-left: 22px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.8;
`;

const Badge = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary || "#858585"};
  font-size: 11px;
  margin-left: 8px;
  opacity: 0.7;
`;

const LoadMoreButton = styled.button<{ level: number }>`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 2px 4px;
  padding-left: ${({ level }) => level * 16 + 22}px;
  font-size: 12px;
  text-align: left;
  height: 22px;
  width: 100%;

  &:hover {
    background-color: rgba(90, 93, 94, 0.31);
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
  }
`;

const ChildrenContainer = styled.div``;

export interface TreeNodeProps {
  label: string;
  description?: string;
  nodeType?: "folder" | "rocrate" | "category" | "file";
  level: number;
  count?: number;
  linkTo?: string;
  children?: React.ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
  onExpand?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  description,
  nodeType = "file",
  level,
  count,
  linkTo,
  children,
  expandable = false,
  defaultExpanded = false,
  onExpand,
  onLoadMore,
  hasMore = false,
  loading = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (expandable) {
      const newExpanded = !expanded;
      setExpanded(newExpanded);

      // Call onExpand only when expanding for the first time
      if (newExpanded && onExpand) {
        onExpand();
      }
    }
  };

  const handleLoadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLoadMore) {
      onLoadMore();
    }
  };

  const getIcon = () => {
    if (nodeType === "rocrate") {
      return expanded ? "📂" : "📁";
    }
    if (nodeType === "folder" || nodeType === "category") {
      return expanded ? "📂" : "📁";
    }
    return "📄";
  };

  const isFolder = nodeType === "folder" || nodeType === "category" || nodeType === "rocrate";

  return (
    <>
      <NodeContainer level={level}>
        <NodeHeader clickable={expandable} onClick={handleToggle}>
          <ExpandIcon visible={expandable}>
            {expandable && (expanded ? "▼" : "▶")}
          </ExpandIcon>
          <FolderIcon isOpen={expanded} isFolder={isFolder}>
            {getIcon()}
          </FolderIcon>
          <NodeContent>
            <NodeLabelRow>
              {linkTo ? (
                <NodeLink to={linkTo} onClick={(e) => e.stopPropagation()}>
                  {label}
                </NodeLink>
              ) : (
                <NodeLabel>{label}</NodeLabel>
              )}
              {count !== undefined && <Badge>{count}</Badge>}
            </NodeLabelRow>
            {description && <Description>{description}</Description>}
          </NodeContent>
        </NodeHeader>
      </NodeContainer>

      {expandable && expanded && (
        <ChildrenContainer>
          {children}
          {hasMore && (
            <LoadMoreButton
              onClick={handleLoadMore}
              disabled={loading}
              level={level + 1}
            >
              {loading ? "Loading..." : "Load 5 more..."}
            </LoadMoreButton>
          )}
        </ChildrenContainer>
      )}
    </>
  );
};

export default TreeNode;
