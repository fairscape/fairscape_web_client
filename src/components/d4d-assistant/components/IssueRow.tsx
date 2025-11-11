import React from "react";
import { Issue } from "../types/issue.types";
import {
  StyledIssueRow,
  IssueTitle,
  IssueMetaRow,
  IssueDate,
  IssueComments,
  Labels,
  IssueLabel,
} from "../styles/D4DAssistant.styles";

interface IssueRowProps {
  issue: Issue;
  onClick: () => void;
}

export const IssueRow: React.FC<IssueRowProps> = ({ issue, onClick }) => {
  return (
    <StyledIssueRow onClick={onClick}>
      <IssueTitle>
        #{issue.number} {issue.title}
      </IssueTitle>
      <IssueMetaRow>
        <IssueDate>{new Date(issue.created_at).toLocaleDateString()}</IssueDate>
        <IssueComments>{issue.comments_count} comments</IssueComments>
      </IssueMetaRow>
      {issue.labels.length > 0 && (
        <Labels>
          {issue.labels.map((label) => (
            <IssueLabel key={label}>{label}</IssueLabel>
          ))}
        </Labels>
      )}
    </StyledIssueRow>
  );
};
