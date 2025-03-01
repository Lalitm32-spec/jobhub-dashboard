
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Edit, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Email } from "@/pages/email/EmailDashboard";

interface EmailsTableProps {
  emails: Email[];
  searchQuery: string;
}

export function EmailsTable({ emails, searchQuery }: EmailsTableProps) {
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const queryClient = useQueryClient();

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: async ({ emailId, newContent }: { emailId: string, newContent: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated.');
      }
      
      const { error } = await supabase
        .from('job_emails')
        .update({ email_content: newContent })
        .eq('id', emailId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      setEditingEmailId(null);
      toast.success("Email updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update email: " + (error as Error).message);
    }
  });

  const handleEdit = (emailId: string, content: string) => {
    setEditingEmailId(emailId);
    setEditedContent(content || "");
  };

  const handleSave = async (emailId: string) => {
    updateEmailMutation.mutate({ emailId, newContent: editedContent });
  };

  const handleCancel = () => {
    setEditingEmailId(null);
    setEditedContent("");
  };

  const handleSendEmail = (email: Email) => {
    const content = email.email_content || "";
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=&su=${encodeURIComponent(
      email.subject
    )}&body=${encodeURIComponent(content)}`;
    window.open(gmailUrl, '_blank');
    toast.success("Opened email in Gmail");
  };

  const handleDeleteEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('job_emails')
        .delete()
        .eq('id', emailId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast.success("Email deleted successfully");
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error("Failed to delete email");
    }
  };

  const filteredEmails = emails.filter(
    (email) =>
      email.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipient</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmails.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No emails found
              </TableCell>
            </TableRow>
          ) : (
            filteredEmails.map((email) => (
              <TableRow key={email.id}>
                <TableCell>{email.recipient}</TableCell>
                <TableCell>{email.subject}</TableCell>
                <TableCell>
                  {email.created_at ? formatDate(email.created_at) : email.date}
                </TableCell>
                <TableCell>
                  {email.updated_at ? formatDate(email.updated_at) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {editingEmailId === email.id ? (
                    <div className="space-y-2">
                      <Textarea 
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[120px] mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSave(email.id)}
                          disabled={updateEmailMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={updateEmailMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(email.id, email.email_content)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSendEmail(email)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEmail(email.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
