
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
import { Moon, Sun, Globe, ChevronRight, Palette } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("english");

  const themeOptions = [
    { value: "light", label: "Light", icon: <Sun className="h-5 w-5" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5" /> },
    { value: "purple", label: "Purple", icon: <Palette className="h-5 w-5 text-purple-500" /> },
    { value: "blue", label: "Blue", icon: <Palette className="h-5 w-5 text-blue-500" /> },
    { value: "green", label: "Green", icon: <Palette className="h-5 w-5 text-green-500" /> },
    { value: "system", label: "System", icon: <Globe className="h-5 w-5" /> },
  ];

  const handleThemeChange = (newTheme: "dark" | "light" | "system" | "purple" | "blue" | "green") => {
    setTheme(newTheme);
    toast({
      title: `${newTheme === 'system' ? 'System' : newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme enabled`,
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
            <div className="space-y-4">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? "default" : "outline"}
                    className={`flex items-center justify-start gap-2 px-3 py-5 h-auto`}
                    onClick={() => handleThemeChange(option.value as "dark" | "light" | "system" | "purple" | "blue" | "green")}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
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
