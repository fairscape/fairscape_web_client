import React from "react";
import { FiPlus, FiMessageSquare } from "react-icons/fi";
import { Issue } from "../types/issue.types";
import { IssueRow } from "../components/IssueRow";
import {
  PageHeader,
  Title,
  Subtitle,
  TwoColumnLayout,
  LeftColumn,
  RightColumn,
  Section,
  SectionTitle,
  LoadingContainer,
  Spinner,
  LoadingText,
  EmptyState,
  EmptyIcon,
  EmptyText,
  IssuesTable,
  TableBody,
  CreateCard,
  CreateIcon,
  CreateTitle,
  CreateDescription,
  CreateButton,
} from "../styles/D4DAssistant.styles";

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
  return (
    <>
      <PageHeader>
        <Title>D4D Assistant</Title>
        <Subtitle>Manage and create D4D datasheets</Subtitle>
      </PageHeader>

      <TwoColumnLayout>
        <LeftColumn>
          <Section>
            <SectionTitle>Existing D4D Conversations</SectionTitle>

            {loading ? (
              <LoadingContainer>
                <Spinner />
                <LoadingText>Loading...</LoadingText>
              </LoadingContainer>
            ) : issues.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <FiMessageSquare size={48} />
                </EmptyIcon>
                <EmptyText>No open issues</EmptyText>
              </EmptyState>
            ) : (
              <IssuesTable>
                <TableBody>
                  {issues.map((issue) => (
                    <IssueRow
                      key={issue.number}
                      issue={issue}
                      onClick={() => onIssueClick(issue.number)}
                    />
                  ))}
                </TableBody>
              </IssuesTable>
            )}
          </Section>
        </LeftColumn>

        <RightColumn>
          <CreateCard>
            <CreateIcon>
              <FiPlus size={64} />
            </CreateIcon>
            <CreateTitle>Create New D4D</CreateTitle>
            <CreateDescription>
              Upload documentation, provide URLs, and let the d4dassistant
              generate a comprehensive datasheet for your project
            </CreateDescription>
            <CreateButton onClick={onCreateClick}>
              <FiPlus size={20} />
              Start New D4D
            </CreateButton>
          </CreateCard>
        </RightColumn>
      </TwoColumnLayout>
    </>
  );
};
