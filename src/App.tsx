import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import BasicSearchPage from "./pages/BasicSearchPage";
import CompareSearchPage from "./pages/CompareSearchPage";
import MetadataDisplayPage from "./pages/MetadataDisplayPage";
import EvidenceGraphPage from "./pages/EvidenceGraphPage";
import ReleaseFormPage from "./pages/ReleaseFormPage";
import { theme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyles";
import DataverseTokensPage from "./pages/DataverseTokensPage";
import CreateRocratePage from "./pages/CreateRocratePage";
import SupportsPage from "./pages/SupportsPage";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle theme={theme} />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/search/basic" element={<BasicSearchPage />} />
              <Route path="/compare" element={<CompareSearchPage />} />
              <Route path="/view/*" element={<MetadataDisplayPage />} />
              <Route path="/evidence/*" element={<EvidenceGraphPage />} />
              <Route path="/create-release" element={<ReleaseFormPage />} />
              <Route path="/tokens" element={<DataverseTokensPage />} />
              <Route path="/create-rocrate" element={<CreateRocratePage />} />
              <Route path="/supports/*" element={<SupportsPage />} />
              {/* Add other routes as needed */}
              <Route
                path="*"
                element={
                  <div>
                    <h2>404 Not Found</h2>
                    <p>Sorry, the page you are looking for does not exist.</p>
                  </div>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
