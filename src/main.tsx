
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import NewApplication from './pages/JobBoard/NewApplication.tsx'
import Ghosted from './pages/JobBoard/Ghosted.tsx'
import FollowUps from './pages/JobBoard/FollowUps.tsx'
import Analytics from './pages/JobBoard/Analytics.tsx'
import JobBoard from './pages/JobBoard.tsx'
import Onboarding from './pages/Onboarding.tsx'
import ResumeGenerator from './pages/ResumeGenerator.tsx'
import Emails from './pages/Emails.tsx'
import EmailDashboard from './pages/email/EmailDashboard.tsx'
import EmailCompose from './pages/email/EmailCompose.tsx'
import EmailTemplates from './pages/email/EmailTemplates.tsx'
import Login from './pages/auth/Login.tsx'
import Signup from './pages/auth/Signup.tsx'
import Settings from './pages/Settings.tsx'
import Documentation from './pages/help/Documentation.tsx'
import FAQ from './pages/help/FAQ.tsx'
import Tutorials from './pages/help/Tutorials.tsx'
import Contact from './pages/help/Contact.tsx'
import TermsOfService from './pages/legal/TermsOfService.tsx'
import PrivacyPolicy from './pages/legal/PrivacyPolicy.tsx'
import Library from './pages/Library.tsx'

// Import QueryClientProvider and create a client
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

// Create a client
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="job-board" element={<JobBoard />} />
            <Route path="job-board/new-application" element={<NewApplication />} />
            <Route path="job-board/ghosted" element={<Ghosted />} />
            <Route path="job-board/follow-ups" element={<FollowUps />} />
            <Route path="job-board/analytics" element={<Analytics />} />
            <Route path="library" element={<Library />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="resume-generator" element={<ResumeGenerator />} />
            <Route path="emails" element={<Emails />} />
            <Route path="emails/dashboard" element={<EmailDashboard />} />
            <Route path="emails/compose" element={<EmailCompose />} />
            <Route path="emails/templates" element={<EmailTemplates />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help/documentation" element={<Documentation />} />
            <Route path="help/faq" element={<FAQ />} />
            <Route path="help/tutorials" element={<Tutorials />} />
            <Route path="help/contact" element={<Contact />} />
            <Route path="legal/terms-of-service" element={<TermsOfService />} />
            <Route path="legal/privacy-policy" element={<PrivacyPolicy />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
