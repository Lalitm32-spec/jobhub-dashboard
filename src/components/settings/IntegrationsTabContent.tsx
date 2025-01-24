import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GmailIntegrationCard } from "./GmailIntegrationCard";

export function IntegrationsTabContent() {
  return (
    <div className="space-y-4">
      <GmailIntegrationCard />
      
      <Card>
        <CardHeader>
          <CardTitle>Connected Services</CardTitle>
          <CardDescription>Manage your integrated services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <img src="/linkedin-icon.png" alt="LinkedIn" className="w-6 h-6" />
              <span>LinkedIn</span>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <img src="/indeed-icon.png" alt="Indeed" className="w-6 h-6" />
              <span>Indeed</span>
            </div>
            <Button variant="outline">Connect</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}