import { Mail, Send, FileText } from "lucide-react";

interface EmailMetricsProps {
  totalEmails: number;
  sentEmails: number;
  draftEmails: number;
}

export function EmailMetrics({ totalEmails, sentEmails, draftEmails }: EmailMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Total Emails</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{totalEmails}</p>
      </div>
      <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <div className="flex items-center space-x-2">
          <Send className="h-4 w-4 text-green-500" />
          <h3 className="font-medium">Sent</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{sentEmails}</p>
      </div>
      <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-yellow-500" />
          <h3 className="font-medium">Drafts</h3>
        </div>
        <p className="text-2xl font-bold mt-2">{draftEmails}</p>
      </div>
    </div>
  );
}