import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ThemeProvider,
  createTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Alert,
  Snackbar,
} from "@mui/material";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";
import { styled } from "@mui/system";
import Header from "../components/header_footer/Header";
import Footer from "../components/header_footer/Footer";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  padding: "16px",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
  "& > td": {
    padding: "16px",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  minWidth: "auto",
  padding: "6px",
}));

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
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dataverse Token Management
        </Typography>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="50vh"
          >
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Token ID</StyledTableCell>
                  <StyledTableCell>Endpoint URL</StyledTableCell>
                  <StyledTableCell>Token Value</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map((token) => (
                  <StyledTableRow key={token.tokenUID}>
                    {editingId === token.tokenUID ? (
                      <>
                        <TableCell>{token.tokenUID}</TableCell>
                        <TableCell>
                          <input
                            className="w-full p-2 border rounded"
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
                          <input
                            className="w-full p-2 border rounded"
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
                        <TableCell align="right">
                          <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handleUpdate(token.tokenUID, editToken)
                            }
                          >
                            <Save size={20} />
                          </ActionButton>
                          <ActionButton
                            variant="contained"
                            color="secondary"
                            onClick={() => {
                              setEditingId(null);
                              setEditToken(null);
                            }}
                          >
                            <X size={20} />
                          </ActionButton>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{token.tokenUID}</TableCell>
                        <TableCell>{token.endpointURL}</TableCell>
                        <TableCell>••••••••••••</TableCell>
                        <TableCell align="right">
                          <ActionButton
                            variant="contained"
                            color="primary"
                            onClick={() => startEditing(token)}
                          >
                            <Pencil size={20} />
                          </ActionButton>
                          <ActionButton
                            variant="contained"
                            color="secondary"
                            onClick={() => handleDelete(token.tokenUID)}
                          >
                            <Trash2 size={20} />
                          </ActionButton>
                        </TableCell>
                      </>
                    )}
                  </StyledTableRow>
                ))}
                <StyledTableRow>
                  <TableCell>
                    <input
                      className="w-full p-2 border rounded"
                      placeholder="Token ID"
                      value={newToken.tokenUID}
                      onChange={(e) =>
                        setNewToken({ ...newToken, tokenUID: e.target.value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <input
                      className="w-full p-2 border rounded"
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
                    <input
                      className="w-full p-2 border rounded"
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
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAdd}
                      startIcon={<Plus size={20} />}
                    >
                      Add Token
                    </Button>
                  </TableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default DataverseTokensPage;
