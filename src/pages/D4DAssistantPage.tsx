import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  FiUpload,
  FiFile,
  FiCheck,
  FiAlertCircle,
  FiPlus,
  FiMessageSquare,
  FiX,
} from "react-icons/fi";

const ALLOWED_PROJECTS = ["cm4ai", "chorus", "voice", "ai-readi"];
const API_URL = "http://localhost:5005";

const D4DAssistantPage = () => {
  const [view, setView] = useState("list");
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("idle");

  const [newIssue, setNewIssue] = useState({
    project: "",
    urls: "",
    instructions: "",
    files: [],
  });

  const [newComment, setNewComment] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/issues?state=open`);
      if (!response.ok) throw new Error("Failed to fetch issues");
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
      showStatus(`Error loading issues: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchIssueDetail = async (issueNumber) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/issues/${issueNumber}`);
      if (!response.ok) throw new Error("Failed to fetch issue details");
      const data = await response.json();
      setSelectedIssue(data);
      setView("detail");
    } catch (error) {
      console.error("Error fetching issue:", error);
      showStatus(`Error loading issue: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewIssue({ ...newIssue, files });
  };

  const createIssue = async () => {
    if (!newIssue.project) {
      showStatus("Please select a project", "error");
      return;
    }

    setLoading(true);
    try {
      const body = `@d4dassistant Create a new D4D for ${newIssue.project}

Documentation URLs:
${newIssue.urls || "No URLs provided"}

Additional Instructions:
${newIssue.instructions || "No additional instructions"}`;

      const formData = new FormData();
      formData.append("title", `D4D for ${newIssue.project}`);
      formData.append("body", body);
      formData.append("labels", "d4d-assistant");

      newIssue.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${API_URL}/issues`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create issue");

      const data = await response.json();
      showStatus("Issue created successfully!", "success");
      setNewIssue({ project: "", urls: "", instructions: "", files: [] });
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchIssues();
      setView("list");
    } catch (error) {
      console.error("Error creating issue:", error);
      showStatus(`Error creating issue: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) {
      showStatus("Please enter a comment", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/issues/${selectedIssue.number}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: newComment }),
        }
      );

      if (!response.ok) throw new Error("Failed to add comment");

      showStatus("Comment added!", "success");
      setNewComment("");
      fetchIssueDetail(selectedIssue.number);
    } catch (error) {
      console.error("Error adding comment:", error);
      showStatus(`Error adding comment: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const closeIssue = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/issues/${selectedIssue.number}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: "closed" }),
        }
      );

      if (!response.ok) throw new Error("Failed to close issue");

      showStatus("Issue closed!", "success");
      setView("list");
      fetchIssues();
    } catch (error) {
      console.error("Error closing issue:", error);
      showStatus(`Error closing issue: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (message, type) => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => setStatusType("idle"), 3000);
  };

  return (
    <PageContainer>
      {statusType !== "idle" && (
        <StatusMessage status={statusType}>
          {statusType === "success" && <FiCheck size={20} />}
          {statusType === "error" && <FiAlertCircle size={20} />}
          <span>{statusMessage}</span>
        </StatusMessage>
      )}

      {view === "list" && (
        <>
          <PageHeader>
            <Title>D4D Assistant</Title>
            <Subtitle>Manage and create D4D datasheets</Subtitle>
          </PageHeader>

          <TwoColumnLayout>
            <LeftColumn>
              <Section>
                <SectionTitle>Existing D4D Issues</SectionTitle>

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
                          onClick={() => fetchIssueDetail(issue.number)}
                        >
                          <IssueTitle>
                            #{issue.number} {issue.title}
                          </IssueTitle>
                          <IssueMetaRow>
                            <IssueDate>
                              {new Date(issue.created_at).toLocaleDateString()}
                            </IssueDate>
                            <IssueComments>
                              {issue.comments_count} comments
                            </IssueComments>
                          </IssueMetaRow>
                          {issue.labels.length > 0 && (
                            <Labels>
                              {issue.labels.map((label) => (
                                <IssueLabel key={label}>{label}</IssueLabel>
                              ))}
                            </Labels>
                          )}
                        </IssueRow>
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
                <CreateButton onClick={() => setView("create")}>
                  <FiPlus size={20} />
                  Start New D4D
                </CreateButton>
              </CreateCard>
            </RightColumn>
          </TwoColumnLayout>
        </>
      )}

      {view === "create" && (
        <>
          <PageHeader>
            <BackButton onClick={() => setView("list")}>← Back</BackButton>
            <Title>Create New D4D</Title>
            <Subtitle>
              Upload PDFs, provide URLs, and instruct the d4dassistant
            </Subtitle>
          </PageHeader>

          <Section>
            <FormGroup>
              <Label>Project *</Label>
              <Select
                value={newIssue.project}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, project: e.target.value })
                }
              >
                <option value="">-- Select a project --</option>
                {ALLOWED_PROJECTS.map((project) => (
                  <option key={project} value={project}>
                    {project.toUpperCase()}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Upload Files (PDFs, HTML)</Label>
              <FileInputWrapper>
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.html,.htm"
                  multiple
                  onChange={handleFileSelect}
                />
                <UploadButton onClick={() => fileInputRef.current?.click()}>
                  <FiUpload size={20} />
                  Select Files
                </UploadButton>
              </FileInputWrapper>
              {newIssue.files.length > 0 && (
                <FilesList>
                  {newIssue.files.map((file, idx) => (
                    <FileItem key={idx}>
                      <FiFile />
                      <FileName>{file.name}</FileName>
                      <FileSize>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </FileSize>
                    </FileItem>
                  ))}
                </FilesList>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Documentation URLs</Label>
              <Textarea
                rows={5}
                placeholder="https://example.com/docs&#10;https://example.com/irb"
                value={newIssue.urls}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, urls: e.target.value })
                }
              />
            </FormGroup>

            <FormGroup>
              <Label>Additional Instructions</Label>
              <Textarea
                rows={8}
                placeholder="Please include information about data collection methods, ethical considerations, and use cases..."
                value={newIssue.instructions}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, instructions: e.target.value })
                }
              />
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={() => setView("list")}>
                Cancel
              </CancelButton>
              <SubmitButton onClick={createIssue} disabled={loading}>
                {loading ? "Creating..." : "Create D4D Issue"}
              </SubmitButton>
            </ButtonGroup>
          </Section>
        </>
      )}

      {view === "detail" && selectedIssue && (
        <>
          <PageHeader>
            <BackButton onClick={() => setView("list")}>← Back</BackButton>
            <Title>
              #{selectedIssue.number} {selectedIssue.title}
            </Title>
            <IssueMetadata>
              Opened by {selectedIssue.user} on{" "}
              {new Date(selectedIssue.created_at).toLocaleDateString()}
            </IssueMetadata>
          </PageHeader>

          <Section>
            <IssueBody>
              <CommentHeader>
                <CommentAuthor>{selectedIssue.user}</CommentAuthor>
                <CommentDate>
                  {new Date(selectedIssue.created_at).toLocaleString()}
                </CommentDate>
              </CommentHeader>
              <CommentBody>{selectedIssue.body}</CommentBody>
            </IssueBody>
          </Section>

          {selectedIssue.comments.length > 0 && (
            <Section>
              <SectionTitle>Comments</SectionTitle>
              {selectedIssue.comments.map((comment) => (
                <Comment key={comment.id}>
                  <CommentHeader>
                    <CommentAuthor>{comment.user}</CommentAuthor>
                    <CommentDate>
                      {new Date(comment.created_at).toLocaleString()}
                    </CommentDate>
                  </CommentHeader>
                  <CommentBody>{comment.body}</CommentBody>
                </Comment>
              ))}
            </Section>
          )}

          <Section>
            <SectionTitle>Add Comment</SectionTitle>
            <Textarea
              rows={6}
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <ButtonGroup>
              <CloseButton onClick={closeIssue} disabled={loading}>
                <FiX size={18} />
                Close Issue
              </CloseButton>
              <SubmitButton onClick={addComment} disabled={loading}>
                {loading ? "Adding..." : "Add Comment"}
              </SubmitButton>
            </ButtonGroup>
          </Section>
        </>
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
`;

const PageHeader = styled.div`
  margin-bottom: 40px;
  text-align: center;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #3e7aa8;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
`;

const IssueMetadata = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-top: 10px;
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 30px;
  align-items: start;
`;

const LeftColumn = styled.div``;

const RightColumn = styled.div``;

const Section = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CreateCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 50px 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const CreateIcon = styled.div`
  color: #3e7aa8;
  opacity: 0.3;
`;

const CreateTitle = styled.h2`
  font-size: 1.8rem;
  color: #3e7aa8;
  margin: 0;
`;

const CreateDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 10px;

  &:hover {
    background: #218838;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #3e7aa8;
  margin: 0 0 20px 0;
`;

const IssuesTable = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
`;

const TableBody = styled.div``;

const IssueRow = styled.div`
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const IssueTitle = styled.div`
  font-weight: 600;
  color: #3e7aa8;
  margin-bottom: 8px;
`;

const IssueMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const IssueDate = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const IssueComments = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const Labels = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
`;

const IssueLabel = styled.span`
  background: #e7f3ff;
  color: #0366d6;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 1.1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #3e7aa8;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2c5f8d;
    box-shadow: 0 0 0 3px rgba(62, 122, 168, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #3e7aa8;
  border-radius: 6px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2c5f8d;
    box-shadow: 0 0 0 3px rgba(62, 122, 168, 0.1);
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const HiddenInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: #3e7aa8;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2c5f8d;
  }
`;

const FilesList = styled.div`
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  color: #333;

  svg {
    color: #3e7aa8;
  }
`;

const FileName = styled.span`
  font-weight: 500;
  flex: 1;
`;

const FileSize = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #218838;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  padding: 12px 24px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #c82333;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const IssueBody = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 20px;
`;

const Comment = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 15px;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  color: #3e7aa8;
`;

const CommentDate = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const CommentBody = styled.div`
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
`;

const StatusMessage = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 20px;
  border-radius: 6px;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

  ${(props) =>
    props.status === "success" &&
    `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `}

  ${(props) =>
    props.status === "error" &&
    `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 15px;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3e7aa8;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  color: #ccc;
  margin-bottom: 15px;
`;

const EmptyText = styled.div`
  font-size: 1rem;
  color: #666;
  font-weight: 600;
`;

export default D4DAssistantPage;
