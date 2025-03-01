
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkEmailForm } from "@/components/email/BulkEmailForm";
import { EmailMetrics } from "@/components/email/EmailMetrics";
import { EmailsTable } from "@/components/email/EmailsTable";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Email } from "@/pages/email/EmailDashboard";

// Mock data with the correct Email type
const mockEmails: Email[] = [
  {
    id: "1",
    email_id: "email-id-1",
    recipient: "hiring.manager@company.com",
    sender: "user@example.com",
    subject: "Software Engineer Position Application",
    status: "draft",
    date: "2024-01-18",
    received_at: "2024-01-18",
    created_at: "2024-01-18",
    updated_at: "2024-01-18",
    email_content: "Sample email content",
    user_id: "user-id-1",
    category: null
  },
  {
    id: "2",
    email_id: "email-id-2",
    recipient: "recruiter@techcorp.com",
    sender: "user@example.com",
    subject: "Senior Developer Role Inquiry",
    status: "sent",
    date: "2024-01-17",
    received_at: "2024-01-17",
    created_at: "2024-01-17",
    updated_at: "2024-01-17",
    email_content: "Sample email content",
    user_id: "user-id-1",
    category: null
  },
  {
    id: "3",
    email_id: "email-id-3",
    recipient: "jobs@startup.io",
    sender: "user@example.com",
    subject: "Full Stack Developer Application",
    status: "draft",
    date: "2024-01-16",
    received_at: "2024-01-16",
    created_at: "2024-01-16",
    updated_at: "2024-01-16",
    email_content: "Sample email content",
    user_id: "user-id-1",
    category: null
  },
];

export default function Emails() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emails, setEmails] = useState<Email[]>(mockEmails);

  const totalEmails = emails.length;
  const sentEmails = emails.filter((email) => email.status === "sent").length;
  const draftEmails = emails.filter((email) => email.status === "draft").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cold Emails</h1>
          <p className="text-muted-foreground">
            Manage and send your cold emails to potential employers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Email
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Bulk Emails</DialogTitle>
              <DialogDescription>
                Send personalized cold emails to multiple recipients
              </DialogDescription>
            </DialogHeader>
            <BulkEmailForm />
          </DialogContent>
        </Dialog>
      </div>

      <EmailMetrics
        totalEmails={totalEmails}
        sentEmails={sentEmails}
        draftEmails={draftEmails}
      />

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <EmailsTable 
        emails={emails} 
        searchQuery={searchQuery} 
      />
    </div>
  );
}
