
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function GmailIntegrationCard() {
  const queryClient = useQueryClient();

  const { data: integration, isLoading } = useQuery({
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

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('gmail_integrations')
        .delete()
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gmail-integration'] });
      toast.success("Gmail disconnected successfully");
    },
    onError: (error) => {
      console.error('Error disconnecting Gmail:', error);
      toast.error("Failed to disconnect Gmail");
    }
  });

  const handleConnect = () => {
    // Gmail OAuth scope for reading emails
    const scope = 'https://www.googleapis.com/auth/gmail.readonly';
    
    // Redirect URI should match what's configured in Google Cloud Console
    const redirectUri = `${window.location.origin}/api/auth/callback/google`;
    
    // Google OAuth endpoint
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    // Open Google's OAuth consent screen
    window.location.href = googleAuthUrl;
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  const isConnected = !!integration?.gmail_token;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Gmail Integration
        </CardTitle>
        <CardDescription>
          Connect your Gmail account to automatically track job application emails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>{isConnected ? 'Connected' : 'Not connected'}</span>
          </div>
          
          {!isConnected && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium text-yellow-800">Gmail account not connected</h4>
                  <p className="text-sm text-yellow-700">
                    Connect your Gmail account to automatically track job application emails and updates
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={isConnected ? handleDisconnect : handleConnect}
            variant={isConnected ? "outline" : "default"}
            disabled={isLoading || disconnectMutation.isPending}
          >
            {isLoading ? "Loading..." : 
             disconnectMutation.isPending ? "Disconnecting..." :
             isConnected ? "Disconnect Gmail" : "Connect Gmail"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
