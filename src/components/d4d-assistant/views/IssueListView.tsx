import React from "react";
import {
  PageContainer,
  PageHeader,
  Title,
  Subtitle,
  CreateCard,
  CreateIcon,
  CreateTitle,
  CreateDescription,
  CreateButton,
  SectionTitle,
  IssuesTable,
  TableBody,
  StyledIssueRow,
  IssueTitle,
  IssueMetaRow,
  IssueDate,
  IssueComments,
  Labels,
  IssueLabel,
  LoadingContainer,
  Spinner,
  LoadingText,
  EmptyState,
  EmptyIcon,
  EmptyText,
} from "../styles/D4DAssistant.styles";
import { FileText, Plus } from "lucide-react";

interface Issue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
  };
  labels: Array<{
    name: string;
  }>;
  comments: number;
}

interface IssueListViewProps {
  issues: Issue[];
  loading: boolean;
  onIssueClick: (issueNumber: number) => void;
  onCreateClick: () => void;
}

export const IssueListView: React.FC<IssueListViewProps> = ({
  issues,
  loading,
  onIssueClick,
  onCreateClick,
}) => {
  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading D4D issues...</LoadingText>
      </LoadingContainer>
    );
  }

  if (issues.length === 0) {
    return (
      <PageContainer>
        <PageHeader>
          <Title>D4D Assistant</Title>
          <Subtitle>
            Create and manage Data for Datasets (D4D) issues with AI assistance
          </Subtitle>
        </PageHeader>

        <CreateCard>
          <CreateIcon>
            <FileText size={80} />
          </CreateIcon>
          <CreateTitle>No D4D Issues Yet</CreateTitle>
          <CreateDescription>
            Get started by creating your first Data for Dataset (D4D) issue. The
            AI assistant will help you generate comprehensive dataset
            documentation.
          </CreateDescription>
          <CreateButton onClick={onCreateClick}>
            <Plus size={20} />
            Create Your First D4D
          </CreateButton>
        </CreateCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Title>D4D Assistant</Title>
        <Subtitle>
          Create and manage Data for Datasets (D4D) issues with AI assistance
        </Subtitle>
      </PageHeader>

      <CreateCard>
        <CreateButton onClick={onCreateClick}>
          <Plus size={20} />
          Create New D4D Issue
        </CreateButton>
      </CreateCard>

      <div style={{ marginTop: "30px" }}>
        <SectionTitle>Open Issues</SectionTitle>
        <IssuesTable>
          <TableBody>
            {issues.map((issue) => (
              <StyledIssueRow
                key={issue.number}
                onClick={() => onIssueClick(issue.number)}
              >
                <IssueTitle>{issue.title}</IssueTitle>
                <IssueMetaRow>
                  <IssueDate>
                    Updated {new Date(issue.updated_at).toLocaleDateString()}
                  </IssueDate>
                  <IssueComments>{issue.comments} comments</IssueComments>
                </IssueMetaRow>
                {issue.labels.length > 0 && (
                  <Labels>
                    {issue.labels.map((label) => (
                      <IssueLabel key={label.name}>{label.name}</IssueLabel>
                    ))}
                  </Labels>
                )}
              </StyledIssueRow>
            ))}
          </TableBody>
        </IssuesTable>
      </div>
    </PageContainer>
  );
};
