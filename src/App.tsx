import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { ResumeGenerator } from "@/pages/ResumeGenerator";
import { Navbar } from "@/components/Navbar";
import { Home } from "@/pages/Home";
import Settings from "@/pages/Settings";
import { Profile } from "@/pages/Profile";
import { Auth } from "@/pages/Auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Navbar />
        <main className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/resume-generator"
              element={
                <ProtectedRoute>
                  <ResumeGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}