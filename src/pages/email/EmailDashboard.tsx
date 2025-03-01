
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmailsTable } from "@/components/email/EmailsTable";
import { Button } from "@/components/ui/button";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export interface Email {
  id: string;
  email_id: string;
  subject: string;
  sender: string;
  recipient: string;
  received_at: string;
  created_at: string;
  updated_at?: string;
  email_content: string;
  user_id: string;
  category: string | null;
  status: "draft" | "sent";
  date: string;
}

export function EmailDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Query for fetching emails
  const { data: emails, isLoading } = useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from("job_emails")
        .select("*")
        .eq("user_id", session.session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match Email type
      return data?.map((email) => ({
        id: email.id,
        email_id: email.email_id,
        recipient: email.sender,
        sender: email.sender,
        subject: email.subject,
        status: "sent" as const, // Explicitly type as "sent"
        date: email.received_at || email.created_at,
        email_content: email.email_content || "",
        created_at: email.created_at,
        updated_at: email.updated_at || email.created_at, // Fallback to created_at if updated_at is null
        category: email.category,
        user_id: email.user_id,
        received_at: email.received_at
      })) || [];
    },
  });

  // Mutation for processing emails
  const processEmailsMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('Not authenticated');
      }
      
      const { data, error } = await supabase.functions.invoke('process-emails', {
        body: { userId: session.session.user.id }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Emails processed successfully");
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
    onError: (error) => {
      console.error("Error processing emails:", error);
      toast.error("Failed to process emails");
    },
  });

  // Handle email processing
  const handleProcessEmails = async () => {
    try {
      await processEmailsMutation.mutateAsync();
    } catch (error) {
      console.error("Error in process emails mutation:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Job Application Emails</h1>
          <p className="text-muted-foreground">
            Track and manage your job application emails
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleProcessEmails}
            disabled={processEmailsMutation.isPending}
          >
            {processEmailsMutation.isPending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Process New Emails
          </Button>
          <Button asChild>
            <Link to="/email/compose">
              <Plus className="mr-2 h-4 w-4" />
              New Email
            </Link>
          </Button>
        </div>
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
        <Button variant="outline" asChild>
          <Link to="/email/templates">Templates</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <EmailsTable emails={emails || []} searchQuery={searchQuery} />
      )}
    </div>
  );
}
