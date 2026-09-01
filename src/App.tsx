import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { theme } from "./styles/theme";
import { GlobalStyle } from "./styles/GlobalStyles";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const UploadPage = lazy(() => import("./pages/UploadPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const BasicSearchPage = lazy(() => import("./pages/BasicSearchPage"));
const CompareSearchPage = lazy(() => import("./pages/CompareSearchPage"));
const MetadataDisplayPage = lazy(() => import("./pages/MetadataDisplayPage"));
const EvidenceGraphPage = lazy(() => import("./pages/EvidenceGraphPage"));
const CreateRelease = lazy(() => import("./pages/CreateReleasePage"));
const EditIdentifierPage = lazy(() => import("./pages/EditIdentifierPage"));
const CreateEntityPage = lazy(() => import("./pages/CreateEntityPage"));
const DataverseTokensPage = lazy(() => import("./pages/DataverseTokensPage"));
const CreateRocratePage = lazy(() => import("./pages/CreateRocratePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AIReadinessPage = lazy(() => import("./pages/AIReadinessPage"));
const AIReadinessDefinitionsPage = lazy(
  () => import("./pages/AIReadinessCriteria"),
);
const D4DAssistantPage = lazy(() => import("./pages/D4DAssistantPage"));

function CatchAllOrRedirect() {
  const pathname = window.location.pathname;
  const arkMatch = pathname.match(/^\/ark:\/?([\d]{5})\/(.*)/);
  if (arkMatch) {
    const normalizedArk = `ark:${arkMatch[1]}/${arkMatch[2]}`;
    return <Navigate to={`/view/${normalizedArk}`} replace />;
  }
  return (
    <div>
      <h2>404 Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}

// Strip trailing slashes off /view/ark: URLs so the ARK resolves cleanly.
function MetadataDisplayRoute() {
  const { pathname, search, hash } = useLocation();
  if (pathname.startsWith("/view/ark:") && pathname.endsWith("/")) {
    const trimmed = pathname.replace(/\/+$/, "");
    return <Navigate to={`${trimmed}${search}${hash}`} replace />;
  }
  return <MetadataDisplayPage />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyle theme={theme} />
        <Router>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/search" element={<BasicSearchPage />} />
                <Route path="/search/basic" element={<BasicSearchPage />} />
                <Route path="/compare" element={<CompareSearchPage />} />
                <Route path="/view/*" element={<MetadataDisplayRoute />} />
                <Route path="/edit/*" element={<EditIdentifierPage />} />
                <Route
                  path="/create/:entityType"
                  element={<CreateEntityPage />}
                />
                <Route path="/evidence/*" element={<EvidenceGraphPage />} />
                <Route path="/review" element={<CreateRelease />} />
                <Route path="/tokens" element={<DataverseTokensPage />} />
                <Route path="/create-rocrate" element={<CreateRocratePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/ai-ready-score/*" element={<AIReadinessPage />} />
                <Route
                  path="/ai-readiness"
                  element={<AIReadinessDefinitionsPage />}
                />
                <Route path="/d4d-assistant" element={<D4DAssistantPage />} />
                <Route path="*" element={<CatchAllOrRedirect />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
