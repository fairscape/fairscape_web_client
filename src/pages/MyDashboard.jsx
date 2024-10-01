import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Button,
  Typography,
  Box,
  CircularProgress,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { styled } from "@mui/system";
import Header from "../components/header_footer/Header";
import Footer from "../components/header_footer/Footer";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

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
  marginRight: theme.spacing(1),
}));

const MyDashboard = () => {
  const [rocrates, setRocrates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "uploadDate",
    direction: "desc",
  });

  useEffect(() => {
    const fetchRocrates = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}/rocrate`, { headers });
        setRocrates(response.data.rocrates);
      } catch (error) {
        console.error("Error fetching ROCrates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRocrates();
  }, []);

  const extractArkIdentifier = (url) => {
    const match = url.match(/(ark:.+)/);
    return match ? match[1] : "";
  };

  const sortedRocrates = React.useMemo(() => {
    let sortableItems = [...rocrates];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === "uploadDate") {
          return sortConfig.direction === "asc"
            ? new Date(a.uploadDate) - new Date(b.uploadDate)
            : new Date(b.uploadDate) - new Date(a.uploadDate);
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [rocrates, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return format(date, "yyyy-MM-dd HH:mm:ss");
  };

  const handleDownload = async (downloadUrl) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", "rocrate.zip");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert(`Download failed. Please try again. Error: ${error.message}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div id="root">
        <Header />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            My Dashboard
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
                    <StyledTableCell>
                      <TableSortLabel
                        active={sortConfig.key === "name"}
                        direction={
                          sortConfig.key === "name"
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => requestSort("name")}
                      >
                        Name
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell>
                      <TableSortLabel
                        active={sortConfig.key === "uploadDate"}
                        direction={
                          sortConfig.key === "uploadDate"
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => requestSort("uploadDate")}
                      >
                        Upload Date
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>Items in Crate</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRocrates.map((rocrate) => (
                    <StyledTableRow key={rocrate["@id"]}>
                      <TableCell>{rocrate.name}</TableCell>
                      <TableCell>{rocrate.description}</TableCell>
                      <TableCell>{formatDate(rocrate.uploadDate)}</TableCell>
                      <TableCell>{rocrate["@graph"]?.length || 0}</TableCell>
                      <TableCell>
                        <ActionButton
                          variant="contained"
                          color="primary"
                          size="small"
                          href={`/rocrate/${extractArkIdentifier(
                            rocrate["@id"]
                          )}`}
                        >
                          View Details
                        </ActionButton>
                        <ActionButton
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleDownload(rocrate.contentURL)}
                        >
                          Download
                        </ActionButton>
                      </TableCell>
                    </StyledTableRow>
                  ))}
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

export default MyDashboard;
