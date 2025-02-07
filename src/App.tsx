import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { ResumeGenerator } from "@/pages/ResumeGenerator";
import Index from "@/pages/Index"; // Assuming you have an Index component
import Dashboard from "@/pages/Dashboard"; // Assuming you have a Dashboard component
import Emails from "@/pages/Emails"; // Assuming you have an Emails component
import JobBoard from "@/pages/JobBoard"; // Assuming you have a JobBoard component
import Settings from "@/pages/Settings"; // Assuming you have a Settings component

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/emails" element={<Emails />} />
              <Route path="/job-board/*" element={<JobBoard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/resume-generator" element={<ResumeGenerator />} />
            </Routes>
          </main>
        </div>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
