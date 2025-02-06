import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Globe, ChevronRight, CreditCard, HelpCircle, LogOut, Trash2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [aiDataRetention, setAiDataRetention] = useState(true);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Tabs defaultValue="general" className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <TabsList>
            <TabsTrigger value="general">Account</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="personalize">Personalize</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">General</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Appearance</h3>
                  <p className="text-sm text-muted-foreground">
                    How JobAtlas looks on your device
                  </p>
                  <div className="flex items-center justify-between">
                    <Label>Light</Label>
                    <Switch
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Language</h3>
                  <p className="text-sm text-muted-foreground">
                    The language used in the user interface
                  </p>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English (US)</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Auto-suggest</h3>
                  <p className="text-sm text-muted-foreground">
                    Enable dropdown and tab complete suggestions while typing a query
                  </p>
                  <Switch
                    checked={autoSuggest}
                    onCheckedChange={setAutoSuggest}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Account</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <User className="h-12 w-12 rounded-full bg-secondary p-2" />
                    <div>
                      <h3 className="font-medium">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground">
                        Click to update your profile picture
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value="jobseeker_123" readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value="user@example.com" readOnly />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">AI Data Retention</h3>
                  <p className="text-sm text-muted-foreground">
                    AI Data Retention allows JobAtlas to use your searches to improve AI models. Turn this setting off if you want to exclude your data from this process.
                  </p>
                  <Switch
                    checked={aiDataRetention}
                    onCheckedChange={setAiDataRetention}
                  />
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">JobAtlas Pro</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Current Plan: Pro</h3>
                    <p className="text-sm text-muted-foreground">
                      Now includes Claude 3, GPT-4, and Stable Diffusion XL
                    </p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">System</h2>
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Active account</h3>
                  <p className="text-sm text-muted-foreground">
                    You are signed in as user@example.com
                  </p>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    Devices or browsers where you are signed in
                  </p>
                  <Button variant="outline">
                    Sign out of all sessions
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-destructive">Delete account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and data
                  </p>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile content will be implemented in the next iteration */}
        </TabsContent>

        <TabsContent value="personalize" className="space-y-6">
          {/* Personalize content will be implemented in the next iteration */}
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          {/* API content will be implemented in the next iteration */}
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-6">
          {/* Enterprise content will be implemented in the next iteration */}
        </TabsContent>
      </Tabs>

      <footer className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & FAQ
          </Button>
          <Button variant="ghost" size="sm">
            Give us feedback
          </Button>
        </div>
        <p>© 2024 JobAtlas AI</p>
      </footer>
    </div>
  );
}