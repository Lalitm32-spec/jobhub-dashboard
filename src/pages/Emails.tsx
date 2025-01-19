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

interface EmailDraft {
  id: string;
  recipient: string;
  subject: string;
  status: "draft" | "sent";
  date: string;
}

export default function Emails() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Example data - in a real app this would come from an API
  const emailDrafts: EmailDraft[] = [
    {
      id: "1",
      recipient: "hiring.manager@company.com",
      subject: "Software Engineer Position Application",
      status: "draft",
      date: "2024-01-18",
    },
    {
      id: "2",
      recipient: "recruiter@techcorp.com",
      subject: "Senior Developer Role Inquiry",
      status: "sent",
      date: "2024-01-17",
    },
  ];

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
        totalEmails={emailDrafts.length}
        sentEmails={emailDrafts.filter((email) => email.status === "sent").length}
        draftEmails={emailDrafts.filter((email) => email.status === "draft").length}
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

      <EmailsTable emails={emailDrafts} searchQuery={searchQuery} />
    </div>
  );
}