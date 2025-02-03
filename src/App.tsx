import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const publicRoutes = ['/', '/auth/login', '/auth/signup'];

const AppContent = () => {
  const location = useLocation();
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex w-full">
      {!isPublicRoute && (
        <>
          <AppSidebar />
          <main className="flex-1 bg-background">
            <SidebarTrigger className="m-4" />
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
            </Routes>
          </main>
        </>
      )}
      {isPublicRoute && (
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
          </Routes>
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
            <SidebarProvider>
              <AppContent />
            </SidebarProvider>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
