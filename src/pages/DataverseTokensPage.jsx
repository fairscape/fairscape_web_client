import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";
import { styled } from "@mui/system";
import Header from "../components/header_footer/Header";
import Footer from "../components/header_footer/Footer";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
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

  const emptyToken = {
    name: "",
    url: "",
    token: "",
  };

  const [newToken, setNewToken] = useState(emptyToken);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockTokens = [
        {
          id: 1,
          name: "UVA Dataverse",
          url: "https://dataverse.uva.edu",
          token: "sasdasf-12311-1dfs",
        },
        {
          id: 2,
          name: "Harvard Dataverse",
          url: "https://dataverse.harvard.edu",
          token: "hdv-9876-token-5432",
        },
      ];
      setTokens(mockTokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedToken) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTokens(
        tokens.map((token) =>
          token.id === id ? { ...token, ...updatedToken } : token
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating token:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTokens(tokens.filter((token) => token.id !== id));
    } catch (error) {
      console.error("Error deleting token:", error);
    }
  };

  const handleAdd = async () => {
    try {
      if (!newToken.name || !newToken.url || !newToken.token) {
        alert("Please fill in all fields");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      const newId = Math.max(...tokens.map((t) => t.id), 0) + 1;
      setTokens([...tokens, { ...newToken, id: newId }]);
      setNewToken(emptyToken);
    } catch (error) {
      console.error("Error adding token:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div id="root">
        <Header />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Dataverse Tokens Management
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
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell>URL</StyledTableCell>
                    <StyledTableCell>Token</StyledTableCell>
                    <StyledTableCell align="right">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tokens.map((token) => (
                    <StyledTableRow key={token.id}>
                      {editingId === token.id ? (
                        <>
                          <TableCell>
                            <input
                              className="w-full p-2 border rounded"
                              value={token.name}
                              onChange={(e) =>
                                setTokens(
                                  tokens.map((t) =>
                                    t.id === token.id
                                      ? { ...t, name: e.target.value }
                                      : t
                                  )
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              className="w-full p-2 border rounded"
                              value={token.url}
                              onChange={(e) =>
                                setTokens(
                                  tokens.map((t) =>
                                    t.id === token.id
                                      ? { ...t, url: e.target.value }
                                      : t
                                  )
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              className="w-full p-2 border rounded"
                              type="password"
                              value={token.token}
                              onChange={(e) =>
                                setTokens(
                                  tokens.map((t) =>
                                    t.id === token.id
                                      ? { ...t, token: e.target.value }
                                      : t
                                  )
                                )
                              }
                            />
                          </TableCell>
                          <TableCell align="right">
                            <ActionButton
                              variant="contained"
                              color="primary"
                              onClick={() => handleUpdate(token.id, token)}
                            >
                              <Save size={20} />
                            </ActionButton>
                            <ActionButton
                              variant="contained"
                              color="secondary"
                              onClick={() => setEditingId(null)}
                            >
                              <X size={20} />
                            </ActionButton>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{token.name}</TableCell>
                          <TableCell>{token.url}</TableCell>
                          <TableCell>••••••••••••</TableCell>
                          <TableCell align="right">
                            <ActionButton
                              variant="contained"
                              color="primary"
                              onClick={() => setEditingId(token.id)}
                            >
                              <Pencil size={20} />
                            </ActionButton>
                            <ActionButton
                              variant="contained"
                              color="secondary"
                              onClick={() => handleDelete(token.id)}
                            >
                              <Trash2 size={20} />
                            </ActionButton>
                          </TableCell>
                        </>
                      )}
                    </StyledTableRow>
                  ))}
                  {/* New Token Row */}
                  <StyledTableRow>
                    <TableCell>
                      <input
                        className="w-full p-2 border rounded"
                        placeholder="Dataverse Name"
                        value={newToken.name}
                        onChange={(e) =>
                          setNewToken({ ...newToken, name: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-2 border rounded"
                        placeholder="Dataverse URL"
                        value={newToken.url}
                        onChange={(e) =>
                          setNewToken({ ...newToken, url: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full p-2 border rounded"
                        type="password"
                        placeholder="API Token"
                        value={newToken.token}
                        onChange={(e) =>
                          setNewToken({ ...newToken, token: e.target.value })
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
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default DataverseTokensPage;
