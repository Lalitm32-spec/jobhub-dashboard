import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface EmailDraft {
  id: string;
  recipient: string;
  subject: string;
  status: "draft" | "sent";
  date: string;
}

interface EmailsTableProps {
  emails: EmailDraft[];
  searchQuery: string;
}

export function EmailsTable({ emails, searchQuery }: EmailsTableProps) {
  const handleSendEmail = (emailId: string) => {
    toast.success("Email sent successfully!");
  };

  const filteredEmails = emails.filter(
    (email) =>
      email.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
  );
}