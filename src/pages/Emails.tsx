import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, Plus, Search, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EmailDraft {
  id: string;
  recipient: string;
  subject: string;
  status: "draft" | "sent";
  date: string;
}

export default function Emails() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
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

  const handleSendEmail = (emailId: string) => {
    toast.success("Email sent successfully!");
  };

  const handleSendBulkEmails = () => {
    if (!recipients || !subject || !emailContent) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success("Bulk emails queued for sending!");
    setIsDialogOpen(false);
    setRecipients("");
    setSubject("");
    setEmailContent("");
  };

  const filteredEmails = emailDrafts.filter(
    (email) =>
      email.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients (one per line)</Label>
                <Textarea
                  id="recipients"
                  placeholder="john@company.com
jane@company.com
recruiter@company.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  placeholder="Software Engineer Position Application"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your email content here..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleSendBulkEmails}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Bulk Emails
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Total Emails</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{emailDrafts.length}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center space-x-2">
            <Send className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Sent</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {emailDrafts.filter((email) => email.status === "sent").length}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Drafts</h3>
          </div>
          <p className="text-2xl font-bold mt-2">
            {emailDrafts.filter((email) => email.status === "draft").length}
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipient</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmails.map((email) => (
              <TableRow key={email.id}>
                <TableCell>{email.recipient}</TableCell>
                <TableCell>{email.subject}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      email.status === "sent"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {email.status}
                  </span>
                </TableCell>
                <TableCell>{email.date}</TableCell>
                <TableCell className="text-right">
                  {email.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => handleSendEmail(email.id)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}