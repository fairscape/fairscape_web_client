import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import axios from "axios";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const TokensPageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const PageTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const Spinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.background};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
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

const TableContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.primary};
`;

const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(odd) {
    background-color: ${({ theme }) => theme.colors.background};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-family: inherit;
  font-size: 1rem;
`;

const ActionButton = styled.button`
  margin-left: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  min-width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.primary {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primaryLight};
    }
  }

  &.secondary {
    background-color: ${({ theme }) => theme.colors.secondary};
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.secondary}dd;
    }
  }
`;

const AddButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const NotificationWrapper = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: 1000;
`;

const Notification = styled.div<{ severity: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ severity, theme }) =>
    severity === "success" ? theme.colors.success : theme.colors.error};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  margin-left: ${({ theme }) => theme.spacing.md};
`;

const ActionsCell = styled(TableCell)`
  text-align: right;
`;

const DataverseTokensPage = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editToken, setEditToken] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const emptyToken = {
    tokenUID: "",
    endpointURL: "",
    tokenValue: "",
  };

  const [newToken, setNewToken] = useState(emptyToken);

  // Optional: Use AuthContext if you want to follow the Dashboard pattern
  // const { isLoggedIn } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });

    // Auto-hide after 6 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, open: false }));
    }, 6000);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/profile/credentials");
      setTokens(response.data || []);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      showNotification(
        error.response?.data?.error || "Failed to fetch tokens",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleUpdate = async (tokenUID, updatedToken) => {
    try {
      const response = await axiosInstance.put("/profile/credentials", {
        tokenUID,
        tokenValue: updatedToken.tokenValue,
        endpointURL: updatedToken.endpointURL,
      });

      if (response.data.updated) {
        fetchTokens();
        setEditingId(null);
        setEditToken(null);
        showNotification("Token updated successfully");
      }
    } catch (error) {
      showNotification(
        error.response?.data?.error || "Failed to update token",
        "error"
      );
    }
  };

  const handleDelete = async (tokenUID) => {
    try {
      const response = await axiosInstance.delete("/profile/credentials", {
        params: { tokenUID },
      });

      if (response.data.deleted) {
        fetchTokens();
        showNotification("Token deleted successfully");
      }
    } catch (error) {
      showNotification(
        error.response?.data?.error || "Failed to delete token",
        "error"
      );
    }
  };

  const handleAdd = async () => {
    try {
      if (!newToken.tokenUID || !newToken.endpointURL || !newToken.tokenValue) {
        showNotification("Please fill in all fields", "error");
        return;
      }

      const response = await axiosInstance.post("/profile/credentials", {
        tokenUID: newToken.tokenUID,
        tokenValue: newToken.tokenValue,
        endpointURL: newToken.endpointURL,
      });

      if (response.data.uploaded) {
        fetchTokens();
        setNewToken(emptyToken);
        showNotification("Token added successfully");
      }
    } catch (error) {
      showNotification(
        error.response?.data?.error || "Failed to add token",
        "error"
      );
    }
  };

  const startEditing = (token) => {
    setEditingId(token.tokenUID);
    setEditToken({ ...token });
  };

  return (
    <TokensPageContainer>
      <PageTitle>Dataverse Token Management</PageTitle>

      {loading ? (
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Token ID</TableHeaderCell>
                <TableHeaderCell>Endpoint URL</TableHeaderCell>
                <TableHeaderCell>Token Value</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: "right" }}>
                  Actions
                </TableHeaderCell>
              </tr>
            </TableHead>
            <tbody>
              {tokens.map((token) => (
                <TableRow key={token.tokenUID}>
                  {editingId === token.tokenUID ? (
                    <>
                      <TableCell>{token.tokenUID}</TableCell>
                      <TableCell>
                        <StyledInput
                          value={editToken.endpointURL}
                          onChange={(e) =>
                            setEditToken({
                              ...editToken,
                              endpointURL: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <StyledInput
                          type="password"
                          value={editToken.tokenValue}
                          onChange={(e) =>
                            setEditToken({
                              ...editToken,
                              tokenValue: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                      <ActionsCell>
                        <ActionButton
                          className="primary"
                          onClick={() =>
                            handleUpdate(token.tokenUID, editToken)
                          }
                        >
                          <Save size={20} />
                        </ActionButton>
                        <ActionButton
                          className="secondary"
                          onClick={() => {
                            setEditingId(null);
                            setEditToken(null);
                          }}
                        >
                          <X size={20} />
                        </ActionButton>
                      </ActionsCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{token.tokenUID}</TableCell>
                      <TableCell>{token.endpointURL}</TableCell>
                      <TableCell>••••••••••••</TableCell>
                      <ActionsCell>
                        <ActionButton
                          className="primary"
                          onClick={() => startEditing(token)}
                        >
                          <Pencil size={20} />
                        </ActionButton>
                        <ActionButton
                          className="secondary"
                          onClick={() => handleDelete(token.tokenUID)}
                        >
                          <Trash2 size={20} />
                        </ActionButton>
                      </ActionsCell>
                    </>
                  )}
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <StyledInput
                    placeholder="Token ID"
                    value={newToken.tokenUID}
                    onChange={(e) =>
                      setNewToken({ ...newToken, tokenUID: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell>
                  <StyledInput
                    placeholder="Endpoint URL"
                    value={newToken.endpointURL}
                    onChange={(e) =>
                      setNewToken({
                        ...newToken,
                        endpointURL: e.target.value,
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <StyledInput
                    type="password"
                    placeholder="Token Value"
                    value={newToken.tokenValue}
                    onChange={(e) =>
                      setNewToken({
                        ...newToken,
                        tokenValue: e.target.value,
                      })
                    }
                  />
                </TableCell>
                <ActionsCell>
                  <AddButton onClick={handleAdd}>
                    <Plus size={20} />
                    Add Token
                  </AddButton>
                </ActionsCell>
              </TableRow>
            </tbody>
          </Table>
        </TableContainer>
      )}

      {notification.open && (
        <NotificationWrapper>
          <Notification severity={notification.severity}>
            {notification.message}
            <CloseButton onClick={handleCloseNotification}>×</CloseButton>
          </Notification>
        </NotificationWrapper>
      )}
    </TokensPageContainer>
  );
};

export default DataverseTokensPage;
