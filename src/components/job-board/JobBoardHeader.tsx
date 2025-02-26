
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, LayoutGrid, RefreshCw, Mail } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JobBoardHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const JobBoardHeader = ({
  searchQuery,
  onSearchChange
}: JobBoardHeaderProps) => {
  const queryClient = useQueryClient();

  // Query to check Gmail integration status
  const { data: integration } = useQuery({
    queryKey: ['gmail-integration'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('gmail_integrations')
        .select('*')
        .eq('user_id', session.session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation for connecting Gmail
  const connectMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('Please log in first');
      }

      const { data, error } = await supabase.functions.invoke('connect-gmail', {
        body: { user: session.session.user }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Error connecting Gmail:', error);
      toast.error("Failed to connect Gmail");
    }
  });

  // Mutation for syncing emails
  const syncEmailsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-gmail', {
        body: {}
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Emails synced successfully");
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: (error) => {
      console.error('Error syncing emails:', error);
      toast.error("Failed to sync emails");
    }
  });

  const handleSync = async () => {
    try {
      await syncEmailsMutation.mutateAsync();
    } catch (error) {
      console.error('Error in sync mutation:', error);
    }
  };

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const isConnected = !!integration?.gmail_token;

  return <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900">JobTrackerAI</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input type="search" placeholder="Search jobs..." className="pl-10 w-[300px]" value={searchQuery} onChange={e => onSearchChange(e.target.value)} />
        </div>
        {!isConnected ? (
          <Button 
            variant="outline" 
            onClick={handleConnect}
            disabled={connectMutation.isPending}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            {connectMutation.isPending ? 'Connecting...' : 'Connect Gmail'}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={handleSync}
            disabled={syncEmailsMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncEmailsMutation.isPending ? 'animate-spin' : ''}`} />
            {syncEmailsMutation.isPending ? 'Syncing...' : 'Sync Emails'}
          </Button>
        )}
        <Button size="icon" variant="outline">
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button className="text-slate-50 bg-rose-600 hover:bg-rose-500">
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>
    </div>;
};
