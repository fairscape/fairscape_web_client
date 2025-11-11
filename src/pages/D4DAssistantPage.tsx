// D4DAssistantPage.tsx
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import {
  FiUpload,
  FiFile,
  FiCheck,
  FiAlertCircle,
  FiPlus,
  FiMessageSquare,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ALLOWED_PROJECTS = ["cm4ai", "chorus", "voice", "ai-readi"];
const API_URL = "http://localhost:5005";

const D4DAssistantPage = () => {
  const [view, setView] = useState("list");
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("idle");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const [expandedHelp, setExpandedHelp] = useState({
    files: false,
    urls: false,
    instructions: false,
  });

  const [newIssue, setNewIssue] = useState({
    project: "",
    urls: "",
    instructions: "",
    files: [],
  });

  const [newComment, setNewComment] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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

      await response.json();
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

      showStatus("D4D ready for review!", "success");
      setShowCloseConfirm(false);
      setView("list");
      fetchIssues();
    } catch (error) {
      console.error("Error closing issue:", error);
      showStatus(`Error closing issue: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCreatedD4D = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/convert/d4d-to-rocrate`);
      if (!response.ok) throw new Error("Failed to convert D4D to RO-Crate");
      const rocrate = await response.json();
      setShowCloseConfirm(false);
      navigate("/review", {
        state: {
          fromD4D: true,
          rocrate,
          issueNumber: selectedIssue?.number ?? null,
        },
      });
    } catch (error) {
      console.error("Error converting D4D:", error);
      showStatus(`Error converting D4D: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (message, type) => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => setStatusType("idle"), 3000);
  };

  const toggleHelp = (section) => {
    setExpandedHelp({ ...expandedHelp, [section]: !expandedHelp[section] });
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

      {showCloseConfirm && (
        <ConfirmDialog>
          <DialogOverlay onClick={() => setShowCloseConfirm(false)} />
          <DialogContent>
            <DialogTitle>Ready to finish the D4D creation process?</DialogTitle>
            <DialogBody>
              <DialogText>
                This will complete your interaction with the AI assistant.
              </DialogText>
              <DialogText>
                The created D4D datasheet will be finalized and available for
                review in FAIRSCAPE.
              </DialogText>
              <DialogNote>
                <FiInfo size={16} />
                <span>
                  You can always create a new issue if you need further
                  modifications later.
                </span>
              </DialogNote>
            </DialogBody>
            <DialogActions>
              <DialogCancelButton onClick={() => setShowCloseConfirm(false)}>
                Cancel
              </DialogCancelButton>
              <DialogConfirmButton
                onClick={handleReviewCreatedD4D}
                disabled={loading}
              >
                {loading ? "Finalizing..." : "Review Created D4D"}
              </DialogConfirmButton>
            </DialogActions>
          </DialogContent>
        </ConfirmDialog>
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
              Work with an AI assistant to create your datasheet
            </Subtitle>
          </PageHeader>

          <InfoBanner>
            <InfoBannerIcon>
              <FiInfo size={24} />
            </InfoBannerIcon>
            <InfoBannerContent>
              <InfoBannerTitle>🤖 AI-Powered D4D Creation</InfoBannerTitle>
              <InfoBannerText>
                This form uses an AI assistant (@d4dassistant) to automatically
                create a Datasheet for Datasets (D4D) from your documentation.
                The AI will:
              </InfoBannerText>
              <InfoBannerList>
                <li>Analyze your uploaded files and URLs</li>
                <li>
                  Extract relevant metadata about data collection, ethics, and
                  use cases
                </li>
                <li>Generate a comprehensive D4D datasheet in YAML format</li>
                <li>Allow you to refine the output through comments</li>
              </InfoBannerList>
              <InfoBannerWarning>
                <FiAlertCircle size={16} />
                <span>
                  <strong>Important:</strong> All materials you provide will be
                  PUBLIC. Only upload documents you're authorized to share
                  publicly.
                </span>
              </InfoBannerWarning>
            </InfoBannerContent>
          </InfoBanner>

          <Section>
            <FormGroup>
              <LabelRow>
                <Label>Project *</Label>
              </LabelRow>
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
              <LabelRow>
                <Label>Upload Documentation (PDFs, HTML)</Label>
                <InfoIcon
                  title="Upload any PUBLIC documents that describe your dataset"
                  onClick={() => toggleHelp("files")}
                >
                  <FiInfo size={18} />
                </InfoIcon>
              </LabelRow>

              <HelpText>
                Upload any <strong>PUBLIC documents</strong> that describe your
                dataset. The AI will extract metadata from these files.
              </HelpText>

              {expandedHelp.files && (
                <ExpandedHelp>
                  <ExpandedHelpTitle>
                    What types of documents should you upload?
                  </ExpandedHelpTitle>
                  <ExpandedHelpList>
                    <li>
                      <strong>Research papers</strong> describing data
                      collection methods and analysis
                    </li>
                    <li>
                      <strong>Ethical review documents</strong> (IRB approvals,
                      ethics protocols)
                    </li>
                    <li>
                      <strong>Data use agreements</strong> or data sharing
                      policies
                    </li>
                    <li>
                      <strong>Grant proposals</strong> or funding documents with
                      dataset descriptions
                    </li>
                    <li>
                      <strong>Protocol documents</strong> detailing data
                      collection procedures
                    </li>
                    <li>
                      <strong>Technical documentation</strong> about data
                      formats, schemas, or APIs
                    </li>
                  </ExpandedHelpList>
                  <ExpandedHelpTitle>
                    What will the AI extract?
                  </ExpandedHelpTitle>
                  <ExpandedHelpText>
                    The AI analyzes these documents to identify:
                  </ExpandedHelpText>
                  <ExpandedHelpList>
                    <li>Data collection methods and procedures</li>
                    <li>Ethical considerations and IRB approvals</li>
                    <li>Dataset composition and size</li>
                    <li>Intended use cases and limitations</li>
                    <li>Data formats and access information</li>
                    <li>Citation information and contributors</li>
                  </ExpandedHelpList>
                  <ExpandedHelpExample>
                    <strong>Example files:</strong> research_protocol.pdf,
                    irb_approval.pdf, data_collection_methods.pdf,
                    Smith2024_dataset_paper.pdf
                  </ExpandedHelpExample>
                </ExpandedHelp>
              )}

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
              <LabelRow>
                <Label>Documentation URLs</Label>
                <InfoIcon
                  title="Provide links to online documentation"
                  onClick={() => toggleHelp("urls")}
                >
                  <FiInfo size={18} />
                </InfoIcon>
              </LabelRow>

              <HelpText>
                Provide URLs to dataset documentation, papers, or repositories.
                One URL per line.
              </HelpText>

              {expandedHelp.urls && (
                <ExpandedHelp>
                  <ExpandedHelpTitle>What URLs are helpful?</ExpandedHelpTitle>
                  <ExpandedHelpList>
                    <li>
                      <strong>Dataset landing pages</strong> (e.g., Dataverse,
                      Zenodo, institutional repositories)
                    </li>
                    <li>
                      <strong>Published papers</strong> (DOI links, PubMed,
                      bioRxiv)
                    </li>
                    <li>
                      <strong>GitHub repositories</strong> with README files or
                      documentation
                    </li>
                    <li>
                      <strong>Project websites</strong> with dataset
                      descriptions
                    </li>
                    <li>
                      <strong>API documentation</strong> or data dictionaries
                    </li>
                    <li>
                      <strong>Protocol registries</strong> (e.g., protocols.io)
                    </li>
                  </ExpandedHelpList>
                  <ExpandedHelpExample>
                    <strong>Example:</strong>
                    <br />
                    https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/ABC123
                    <br />
                    https://doi.org/10.1101/2024.01.15.123456
                    <br />
                    https://github.com/yourorg/dataset-repo
                  </ExpandedHelpExample>
                </ExpandedHelp>
              )}

              <Textarea
                rows={5}
                placeholder="https://example.com/dataset&#10;https://doi.org/10.1234/example&#10;https://github.com/org/dataset-repo"
                value={newIssue.urls}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, urls: e.target.value })
                }
              />
            </FormGroup>

            <FormGroup>
              <LabelRow>
                <Label>Instructions for AI Assistant (Optional)</Label>
                <InfoIcon
                  title="Guide the AI on how to process your materials"
                  onClick={() => toggleHelp("instructions")}
                >
                  <FiInfo size={18} />
                </InfoIcon>
              </LabelRow>

              <HelpText>
                Tell the AI where to find specific information or what to
                emphasize. The more specific you are, the better the results.
              </HelpText>

              {expandedHelp.instructions && (
                <ExpandedHelp>
                  <ExpandedHelpTitle>
                    How to write effective instructions
                  </ExpandedHelpTitle>
                  <ExpandedHelpText>
                    Use this field to guide the AI through your materials. Be
                    specific about:
                  </ExpandedHelpText>
                  <ExpandedHelpList>
                    <li>
                      <strong>Where to find information:</strong> "Look in
                      Smith2024.pdf pages 3-5 for data collection methods"
                    </li>
                    <li>
                      <strong>What documents contain:</strong> "The ethical
                      considerations are in the IRB approval document"
                    </li>
                    <li>
                      <strong>What to emphasize:</strong> "Please emphasize the
                      use cases for clinical research"
                    </li>
                    <li>
                      <strong>Specific sections:</strong> "Include the
                      limitations discussed in section 4 of the paper"
                    </li>
                    <li>
                      <strong>Tables or figures:</strong> "Sample demographics
                      are in Table 2 of methods.pdf"
                    </li>
                    <li>
                      <strong>Text you want included:</strong> "Use the abstract
                      from the main paper as the dataset description"
                    </li>
                  </ExpandedHelpList>
                  <ExpandedHelpTitle>Example instructions</ExpandedHelpTitle>
                  <ExpandedHelpExample>
                    "Please pull information from the publications list at
                    https://cm4ai.org/publications/. Download the papers you
                    think are most relevant for understanding data collection
                    methods, use cases, and ethical considerations. Pay special
                    attention to the main consortium paper (Clark et al.) for
                    overall dataset description. The IRB approval details are in
                    ethics_review.pdf section 3."
                  </ExpandedHelpExample>
                </ExpandedHelp>
              )}

              <Textarea
                rows={8}
                placeholder="Example: Look in the Smith2024.pdf file for data collection methods (pages 3-5). The ethical considerations are described in the IRB approval document. Please emphasize the use cases for clinical research and include the limitations discussed in section 4."
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

          <AIInteractionBanner>
            <AIBannerIcon>
              <FiInfo size={24} />
            </AIBannerIcon>
            <AIBannerContent>
              <AIBannerTitle>🤖 Interacting with AI Assistant</AIBannerTitle>
              <AIBannerText>
                You're reviewing a <strong>D4D (Datasheet for Datasets)</strong>{" "}
                created by @d4dassistant. This is a comprehensive metadata
                document describing your dataset.
              </AIBannerText>
              <AIBannerSection>
                <AIBannerSectionTitle>
                  To request changes or additions:
                </AIBannerSectionTitle>
                <AIBannerList>
                  <li>
                    <strong>Just comment</strong> what you want adjusted below
                  </li>
                  <li>
                    <strong>Be specific:</strong> "Add instance count of 5000 to
                    the composition section"
                  </li>
                  <li>
                    <strong>The AI will respond</strong> and update the D4D
                    datasheet
                  </li>
                  <li>
                    <strong>Keep refining</strong> until you're satisfied with
                    the result
                  </li>
                </AIBannerList>
              </AIBannerSection>
              <AIBannerSection>
                <AIBannerSectionTitle>
                  When you're finished:
                </AIBannerSectionTitle>
                <AIBannerText>
                  Click <strong>"Review Created D4D"</strong> below to finalize
                  your datasheet and complete the AI interaction. The D4D will
                  be available in FAIRSCAPE for final review.
                </AIBannerText>
              </AIBannerSection>
              <AIBannerLink href="#" onClick={(e) => e.preventDefault()}>
                What is a D4D? Learn more →
              </AIBannerLink>
            </AIBannerContent>
          </AIInteractionBanner>

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
            <HelpText style={{ marginBottom: "10px" }}>
              Request changes, ask questions, or provide additional context to
              the AI assistant.
            </HelpText>
            <Textarea
              rows={6}
              placeholder="Example: Please add information about the sample size and data collection timeline. Also, can you include details about the ethical review process mentioned in ethics_approval.pdf?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <ButtonGroup>
              <ReviewButton
                onClick={() => setShowCloseConfirm(true)}
                disabled={loading}
              >
                <FiCheckCircle size={18} />
                Review Created D4D
              </ReviewButton>
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

const InfoBanner = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
  border: 2px solid #3e7aa8;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
`;

const InfoBannerIcon = styled.div`
  color: #3e7aa8;
  flex-shrink: 0;
`;

const InfoBannerContent = styled.div`
  flex: 1;
`;

const InfoBannerTitle = styled.h3`
  font-size: 1.3rem;
  color: #3e7aa8;
  margin: 0 0 15px 0;
`;

const InfoBannerText = styled.p`
  color: #333;
  line-height: 1.6;
  margin: 0 0 15px 0;
`;

const InfoBannerList = styled.ul`
  margin: 0 0 15px 20px;
  padding: 0;
  color: #333;
  line-height: 1.8;

  li {
    margin-bottom: 5px;
  }
`;

const InfoBannerWarning = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  padding: 12px 15px;
  color: #856404;
  margin-top: 15px;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }

  strong {
    color: #856404;
  }
`;

const AIInteractionBanner = styled.div`
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
`;

const AIBannerIcon = styled.div`
  color: #4caf50;
  flex-shrink: 0;
`;

const AIBannerContent = styled.div`
  flex: 1;
`;

const AIBannerTitle = styled.h3`
  font-size: 1.3rem;
  color: #2e7d32;
  margin: 0 0 15px 0;
`;

const AIBannerText = styled.p`
  color: #333;
  line-height: 1.6;
  margin: 0 0 15px 0;
`;

const AIBannerSection = styled.div`
  margin: 20px 0;
`;

const AIBannerSectionTitle = styled.h4`
  font-size: 1rem;
  color: #2e7d32;
  margin: 0 0 10px 0;
  font-weight: 600;
`;

const AIBannerList = styled.ul`
  margin: 0 0 0 20px;
  padding: 0;
  color: #333;
  line-height: 1.8;

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #2e7d32;
  }
`;

const AIBannerLink = styled.a`
  color: #2e7d32;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  margin-top: 10px;

  &:hover {
    text-decoration: underline;
  }
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
  margin-bottom: 20px;
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

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

const InfoIcon = styled.div`
  color: #3e7aa8;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #2c5f8d;
  }
`;

const HelpText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 8px 0;
  line-height: 1.5;

  strong {
    color: #333;
  }
`;

const ExpandedHelp = styled.div`
  background: #f8f9fa;
  border-left: 3px solid #3e7aa8;
  padding: 20px;
  margin: 15px 0;
  border-radius: 4px;
`;

const ExpandedHelpTitle = styled.h4`
  font-size: 1rem;
  color: #3e7aa8;
  margin: 0 0 10px 0;
  font-weight: 600;
`;

const ExpandedHelpText = styled.p`
  font-size: 0.9rem;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.6;
`;

const ExpandedHelpList = styled.ul`
  margin: 0 0 15px 20px;
  padding: 0;
  font-size: 0.9rem;
  color: #333;
  line-height: 1.8;

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #3e7aa8;
  }
`;

const ExpandedHelpExample = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  padding: 12px;
  margin-top: 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #333;
  font-family: monospace;
  line-height: 1.6;

  strong {
    color: #3e7aa8;
    font-family: inherit;
  }
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

const ReviewButton = styled.button`
  padding: 12px 24px;
  background: #28a745;
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
    background: #218838;
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

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DialogOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const DialogContent = styled.div`
  position: relative;
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const DialogTitle = styled.h3`
  font-size: 1.4rem;
  color: #3e7aa8;
  margin: 0 0 20px 0;
`;

const DialogBody = styled.div`
  margin-bottom: 25px;
`;

const DialogText = styled.p`
  color: #333;
  line-height: 1.6;
  margin: 0 0 15px 0;
`;

const DialogNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #e3f2fd;
  border-left: 3px solid #3e7aa8;
  padding: 12px 15px;
  border-radius: 4px;
  color: #333;
  font-size: 0.9rem;
  margin-top: 15px;

  svg {
    flex-shrink: 0;
    color: #3e7aa8;
    margin-top: 2px;
  }
`;

const DialogActions = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

const DialogCancelButton = styled.button`
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

const DialogConfirmButton = styled.button`
  padding: 12px 24px;
  background: #28a745;
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
    background: #218838;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default D4DAssistantPage;
