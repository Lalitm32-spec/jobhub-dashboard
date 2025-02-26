
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmailsTable } from "@/components/email/EmailsTable";
import { Button } from "@/components/ui/button";
import { Plus, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Email {
  id: string;
  email_id: string;
  subject: string;
  sender: string;
  received_at: string;
  email_content: string;
  user_id: string;
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
        .order("received_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Mutation for processing emails
  const processEmailsMutation = useMutation({
    mutationFn: async (emails: Email[]) => {
      const { data, error } = await supabase.functions.invoke('process-emails', {
        body: { emails }
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
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      toast.error("Please log in to process emails");
      return;
    }

    // Get unprocessed emails
    const { data: unprocessedEmails, error: fetchError } = await supabase
      .from("job_emails")
      .select("*")
      .eq("user_id", session.session.user.id)
      .is("category", null);

    if (fetchError) {
      console.error("Error fetching unprocessed emails:", fetchError);
      toast.error("Failed to fetch emails");
      return;
    }

    if (!unprocessedEmails?.length) {
      toast.info("No new emails to process");
      return;
    }

    try {
      await processEmailsMutation.mutateAsync(unprocessedEmails);
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
