import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import {
  PageContainer,
  PageHeader,
  BackButton,
  Title,
  IssueMetadata,
  TwoColumnLayout,
  LeftColumn,
  RightColumn,
  Section,
  SectionTitle,
  IssueBody,
  Comment,
  CommentHeader,
  CommentAuthor,
  CommentDate,
  CommentBody,
  FormGroup,
  Label,
  Textarea,
  SubmitButton,
  ReviewButton,
} from "../styles/D4DAssistant.styles";
import { CheckCircle, Loader, RefreshCw } from "lucide-react";
import { checkActiveActions } from "../api/issuesApi";

interface Issue {
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
  };
  comments: Array<{
    id: number;
    user: {
      login: string;
    };
    created_at: string;
    body: string;
  }>;
}

interface IssueDetailViewProps {
  issue: Issue;
  onBack: () => void;
  onAddComment: (comment: string) => void;
  onReview: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export const IssueDetailView: React.FC<IssueDetailViewProps> = ({
  issue,
  onBack,
  onAddComment,
  onReview,
  onRefresh,
  loading,
}) => {
  const [newComment, setNewComment] = useState("");
  const [activeAction, setActiveAction] = useState<{
    active: boolean;
    url?: string;
  }>({ active: false });
  const [checking, setChecking] = useState(false);

  const checkForActiveActions = useCallback(async () => {
    setChecking(true);
    try {
      const result = await checkActiveActions();

      if (result.active && result.runs.length > 0) {
        setActiveAction({
          active: true,
          url: result.runs[0].html_url,
        });
      } else {
        if (activeAction.active) {
          onRefresh();
        }
        setActiveAction({ active: false });
      }
    } catch (error) {
      console.error("Failed to check active actions:", error);
    } finally {
      setChecking(false);
    }
  }, [activeAction.active, onRefresh]);

  useEffect(() => {
    checkForActiveActions();

    const interval = setInterval(() => {
      checkForActiveActions();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkForActiveActions]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const handleManualCheck = () => {
    checkForActiveActions();
  };

  return (
    <PageContainer>
      <PageHeader>
        <BackButton onClick={onBack}>← Back</BackButton>
        <Title>{issue.title}</Title>
        <IssueMetadata>
          Issue #{issue.number} • Created by {issue.user.login} on{" "}
          {new Date(issue.created_at).toLocaleDateString()}
        </IssueMetadata>
      </PageHeader>

      <TwoColumnLayout>
        <LeftColumn>
          <Section>
            <SectionTitle>Description</SectionTitle>
            <IssueBody>{issue.body}</IssueBody>
          </Section>

          <Section>
            <SectionTitle>Comments ({issue.comments.length})</SectionTitle>
            {issue.comments.map((comment) => (
              <Comment key={comment.id}>
                <CommentHeader>
                  <CommentAuthor>{comment.user.login}</CommentAuthor>
                  <CommentDate>
                    {new Date(comment.created_at).toLocaleString()}
                  </CommentDate>
                </CommentHeader>
                <CommentBody>{comment.body}</CommentBody>
              </Comment>
            ))}

            <FormGroup style={{ marginTop: 30 }}>
              <Label htmlFor="newComment">Add a comment</Label>
              <Textarea
                id="newComment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={5}
              />
            </FormGroup>

            <SubmitButton
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Add Comment
            </SubmitButton>
          </Section>
        </LeftColumn>

        <RightColumn>
          <StickySidebar>
            <SidebarCard>
              <SidebarHeader>
                <SidebarTitle>Actions</SidebarTitle>
                <CheckStatusButton
                  onClick={handleManualCheck}
                  disabled={checking}
                  title="Check for active jobs"
                >
                  <RefreshCw size={16} className={checking ? "spinning" : ""} />
                </CheckStatusButton>
              </SidebarHeader>

              {activeAction.active ? (
                <>
                  <ActiveBanner>
                    <Loader size={16} />
                    <ActiveText>d4dassistant is working</ActiveText>
                  </ActiveBanner>
                  {activeAction.url && (
                    <TrackLink
                      href={activeAction.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Track progress →
                    </TrackLink>
                  )}
                </>
              ) : (
                <>
                  <SidebarText>
                    Run an automated pass and convert this issue to an RO-Crate.
                  </SidebarText>
                  <FullWidthReviewButton onClick={onReview} disabled={loading}>
                    <CheckCircle size={18} />
                    {loading ? "Processing..." : "Review & Convert to RO-Crate"}
                  </FullWidthReviewButton>
                </>
              )}
            </SidebarCard>
          </StickySidebar>
        </RightColumn>
      </TwoColumnLayout>
    </PageContainer>
  );
};

const StickySidebar = styled.aside`
  position: sticky;
  top: 20px;
`;

const SidebarCard = styled.div`
  background: white;
  border-radius: 2px;
  padding: 30px;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SidebarTitle = styled.h3`
  font-size: 1.2rem;
  color: #3e7aa8;
  margin: 0;
`;

const CheckStatusButton = styled.button`
  background: none;
  border: 1px solid #3e7aa8;
  color: #3e7aa8;
  border-radius: 2px;
  padding: 6px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f0f8ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const SidebarText = styled.p`
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ActiveBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f0f8ff;
  border: 1px solid #3e7aa8;
  border-radius: 2px;
  margin-bottom: 12px;

  svg {
    animation: spin 2s linear infinite;
    color: #3e7aa8;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ActiveText = styled.span`
  color: #3e7aa8;
  font-weight: 500;
`;

const TrackLink = styled.a`
  display: inline-block;
  color: #3e7aa8;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

const FullWidthReviewButton = styled(ReviewButton)`
  width: 100%;
  justify-content: center;
`;
