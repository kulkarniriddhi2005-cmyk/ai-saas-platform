import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Loader from "./components/Loader.jsx";
import { useAuth } from "./hooks/useAuth.js";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WriteArticle from "./pages/WriteArticle.jsx";
import ResumeReview from "./pages/ResumeReview.jsx";
import BgRemover from "./pages/BgRemover.jsx";
import TextSummary from "./pages/TextSummary.jsx";
import BlogTitles from "./pages/BlogTitles.jsx";
import EmailWriter from "./pages/EmailWriter.jsx";
import VoiceToText from "./pages/VoiceToText.jsx";
import TextToVoice from "./pages/TextToVoice.jsx";
import CodeGenerator from "./pages/CodeGenerator.jsx";
import HandwritingToText from "./pages/HandwritingToText.jsx";
import DataInsights from "./pages/DataInsights.jsx";
import MemeGenerator from "./pages/MemeGenerator.jsx";
import Login from "./pages/Login.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import AboutContact from "./pages/AboutContact.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="app-main" style={{ padding: "2rem" }}>
        <Loader label="Checking session…" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const showSidebar = !isHomePage;
  const showNavbar = !isHomePage;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {showNavbar && <Navbar />}
      <div className="app-shell">
        {showSidebar && <Sidebar />}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about-contact" element={<AboutContact />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <WriteArticle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumeReview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bg-remove"
              element={
                <ProtectedRoute>
                  <BgRemover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <ProtectedRoute>
                  <TextSummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/titles"
              element={
                <ProtectedRoute>
                  <BlogTitles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/email"
              element={
                <ProtectedRoute>
                  <EmailWriter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voice-to-text"
              element={
                <ProtectedRoute>
                  <VoiceToText />
                </ProtectedRoute>
              }
            />
            <Route
              path="/text-to-voice"
              element={
                <ProtectedRoute>
                  <TextToVoice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/code-generator"
              element={
                <ProtectedRoute>
                  <CodeGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/handwriting-to-text"
              element={
                <ProtectedRoute>
                  <HandwritingToText />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-insights"
              element={
                <ProtectedRoute>
                  <DataInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meme-generator"
              element={
                <ProtectedRoute>
                  <MemeGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
