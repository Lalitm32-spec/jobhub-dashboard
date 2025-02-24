
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, LayoutGrid, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JobBoardHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const JobBoardHeader = ({ searchQuery, onSearchChange }: JobBoardHeaderProps) => {
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

  const handleConnectGmail = () => {
    // Gmail OAuth scope for reading emails
    const scope = 'https://www.googleapis.com/auth/gmail.readonly';
    
    // Redirect URI should match what's configured in Google Cloud Console
    const redirectUri = `${window.location.origin}/api/auth/callback/google`;
    
    // Google OAuth endpoint
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    // Open Google's OAuth consent screen
    window.location.href = googleAuthUrl;
  };

  const isConnected = !!integration?.gmail_token;

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-gray-900">JobTrackerAI</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search jobs..."
            className="pl-10 w-[300px]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button 
          variant={isConnected ? "outline" : "default"}
          onClick={handleConnectGmail}
          className="gap-2"
        >
          <Mail className="h-4 w-4" />
          {isConnected ? "Gmail Connected" : "Connect Gmail"}
        </Button>
        <Button size="icon" variant="outline">
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>
    </div>
  );
};
