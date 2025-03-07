
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NewSidebar } from "@/components/NewSidebar";
import { HelpButton } from "@/components/HelpButton";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import JobBoard from "./pages/JobBoard";
import Analytics from "./pages/JobBoard/Analytics";
import NewApplication from "./pages/JobBoard/NewApplication";
import FollowUps from "./pages/JobBoard/FollowUps";
import Ghosted from "./pages/JobBoard/Ghosted";
import Documentation from "./pages/help/Documentation";
import Tutorials from "./pages/help/Tutorials";
import FAQ from "./pages/help/FAQ";
import Contact from "./pages/help/Contact";
import { EmailDashboard } from "./pages/email/EmailDashboard";
import { EmailTemplates } from "./pages/email/EmailTemplates";
import { EmailCompose } from "./pages/email/EmailCompose";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import ResumeGenerator from "./pages/ResumeGenerator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const publicRoutes = ['/', '/auth/login', '/auth/signup', '/privacy-policy', '/terms-of-service'];

const AppContent = () => {
  const location = useLocation();
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex w-full">
      {!isPublicRoute && (
        <>
          <NewSidebar />
          <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/email">
                <Route index element={<EmailDashboard />} />
                <Route path="templates" element={<EmailTemplates />} />
                <Route path="compose" element={<EmailCompose />} />
              </Route>
              <Route path="/settings" element={<Settings />} />
              <Route path="/job-board" element={<JobBoard />} />
              <Route path="/job-board/analytics" element={<Analytics />} />
              <Route path="/job-board/new" element={<NewApplication />} />
              <Route path="/job-board/follow-ups" element={<FollowUps />} />
              <Route path="/job-board/ghosted" element={<Ghosted />} />
              <Route path="/help/documentation" element={<Documentation />} />
              <Route path="/help/tutorials" element={<Tutorials />} />
              <Route path="/help/faq" element={<FAQ />} />
              <Route path="/help/contact" element={<Contact />} />
              <Route path="/resume-generator" element={<ResumeGenerator />} />
            </Routes>
          </main>
          <HelpButton />
        </>
      )}
      {isPublicRoute && (
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
          </Routes>
          <HelpButton />
        </main>
      )}
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
