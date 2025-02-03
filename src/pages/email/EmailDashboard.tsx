import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmailsTable } from "@/components/email/EmailsTable";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";

export function EmailDashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: emails, isLoading } = useQuery({
    queryKey: ["emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_emails")
        .select("*")
        .order("received_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cold Emails</h1>
          <p className="text-muted-foreground">
            Manage and track your cold email campaigns
          </p>
        </div>
        <Button asChild>
          <Link to="/email/compose">
            <Plus className="mr-2 h-4 w-4" />
            New Email
          </Link>
        </Button>
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
        <div>Loading...</div>
      ) : (
        <EmailsTable emails={emails || []} searchQuery={searchQuery} />
      )}
    </div>
  );
}