import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function GmailIntegrationCard() {
  const { data: integration, isLoading } = useQuery({
    queryKey: ['gmail-integration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gmail_integrations')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const handleConnect = async () => {
    // For now, just show a toast - we'll implement OAuth flow later
    toast.info("Gmail integration will be implemented soon");
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
            onClick={handleConnect}
            variant={isConnected ? "outline" : "default"}
          >
            {isConnected ? "Reconnect Gmail" : "Connect Gmail"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}