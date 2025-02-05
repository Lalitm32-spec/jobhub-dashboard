import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntegrationsTabContent } from "@/components/settings/IntegrationsTabContent";
import { SubscriptionTabContent } from "@/components/settings/SubscriptionTabContent";
import { AIUsageStats } from "@/components/settings/AIUsageStats";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Moon, Sun, Globe, ChevronRight } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    document.documentElement.classList.toggle("dark", newDarkMode);
    toast({
      title: `${newDarkMode ? "Dark" : "Light"} mode enabled`,
      description: `The application theme has been updated.`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how JobHub looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDarkMode}
                className="dark:border-white/10"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <Label>Language</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Help & Support</CardTitle>
            <CardDescription>Get help with JobHub</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => window.open('/help/documentation', '_blank')}
            >
              Documentation
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => window.open('/help/contact', '_blank')}
            >
              Contact Support
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => window.open('/help/faq', '_blank')}
            >
              FAQs
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal</CardTitle>
            <CardDescription>Review our terms and policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => window.open('/terms', '_blank')}
            >
              Terms of Service
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => window.open('/privacy', '_blank')}
            >
              Privacy Policy
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}