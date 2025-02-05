import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/FileUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntegrationsTabContent } from "@/components/settings/IntegrationsTabContent";
import { SubscriptionTabContent } from "@/components/settings/SubscriptionTabContent";
import { AIUsageStats } from "@/components/settings/AIUsageStats";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Check, X, Moon, Sun, Globe, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled in localStorage
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast({
      title: `${newDarkMode ? "Dark" : "Light"} mode enabled`,
      description: `The application theme has been updated.`,
    });
  };

  const handleTestConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-ai-connection', {
        body: { provider: selectedProvider, apiKey }
      });

      if (error) throw error;

      setIsConnected(true);
      toast({
        title: "Connection successful",
        description: "Successfully connected to the AI provider.",
      });
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSaveInstructions = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleResumeUpload = (file: File) => {
    toast({
      title: "Resume uploaded",
      description: "Your resume has been saved successfully.",
    });
    localStorage.setItem('userResume', URL.createObjectURL(file));
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-[#FAFAFA] dark:bg-gray-900">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#1A2B3B] dark:text-white">Settings</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="border-[#E2E8F0] dark:border-gray-700"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="ai" className="rounded-lg">AI Settings</TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg">Account</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
          <TabsTrigger value="resume" className="rounded-lg">Resume</TabsTrigger>
          <TabsTrigger value="subscription" className="rounded-lg">Subscription</TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-lg">Data & Privacy</TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-lg">Integrations</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LLM Provider Configuration</CardTitle>
              <CardDescription>Configure your AI provider settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Default AI Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                  <Button onClick={handleTestConnection}>Test Connection</Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {isConnected ? (
                    <>
                      <Check className="text-green-500" size={16} />
                      <span className="text-green-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <X className="text-red-500" size={16} />
                      <span className="text-red-500">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
              <AIUsageStats />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="2fa" />
                <Label htmlFor="2fa">Enable Two-Factor Authentication</Label>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="app-status" defaultChecked />
                <Label htmlFor="app-status">Application Status Alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="weekly-summary" defaultChecked />
                <Label htmlFor="weekly-summary">Weekly Summary Reports</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="ai-warnings" />
                <Label htmlFor="ai-warnings">AI Usage Warnings</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resume Management</CardTitle>
              <CardDescription>Customize your resume settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Template</Label>
                <Select defaultValue="modern">
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <FileUpload
                label="Upload Resume"
                acceptedFiles={[".pdf", ".docx"]}
                description="Upload your resume (PDF or Word document)"
                onFileUpload={handleResumeUpload}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionTabContent />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Controls</CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Export All Data</Button>
              <Button variant="destructive" className="w-full">Delete All Data</Button>
              <div className="space-y-2">
                <Label>Auto-delete old entries after</Label>
                <Select defaultValue="90">
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <IntegrationsTabContent />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the application appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for a better viewing experience in low-light conditions
                  </p>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Links */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <a href="/language" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Globe className="h-5 w-5 mr-2" />
              <span>English (English)</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
            <a href="/help" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Help & Support
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
          <Button className="bg-[#1A2B3B] hover:bg-[#2C3E50] text-white flex items-center gap-2">
            <Search className="h-4 w-4" />
            Try Job Search Pro
          </Button>
        </div>
      </div>
    </div>
  );
}
