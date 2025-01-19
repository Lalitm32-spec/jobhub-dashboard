import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";

export default function Settings() {
  const { toast } = useToast();
  const [agentInstructions, setAgentInstructions] = useState("");
  
  const handleSaveInstructions = () => {
    toast({
      title: "Instructions saved",
      description: "Your AI agent instructions have been updated successfully.",
    });
  };

  const handleResumeUpload = (file: File) => {
    // Here you would typically handle the file upload to your storage
    toast({
      title: "Resume uploaded",
      description: "Your resume has been saved successfully.",
    });
    // Store the resume in localStorage for demo purposes
    // In a real app, you'd want to store this in a proper backend
    localStorage.setItem('userResume', URL.createObjectURL(file));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Resume</CardTitle>
              <CardDescription>Upload your default resume that will be used for all job applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                label="Upload Resume"
                acceptedFiles={[".pdf", ".docx"]}
                description="Upload your resume (PDF or Word document)"
                onFileUpload={handleResumeUpload}
              />
              {localStorage.getItem('userResume') && (
                <div className="mt-4">
                  <p className="text-sm text-green-600">✓ Resume uploaded successfully</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      localStorage.removeItem('userResume');
                      toast({
                        title: "Resume removed",
                        description: "Your resume has been removed successfully.",
                      });
                    }}
                  >
                    Remove Resume
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted">
                <div className="font-semibold">Current Plan: Pro</div>
                <div className="text-sm text-muted-foreground">Billing cycle: Monthly</div>
                <div className="text-sm text-muted-foreground">Next billing date: June 1, 2024</div>
              </div>
              <Button variant="outline">Manage Subscription</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Settings</CardTitle>
              <CardDescription>Customize how your AI agent behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions">Agent Instructions</Label>
                <Textarea 
                  id="instructions" 
                  placeholder="Enter custom instructions for your AI agent..."
                  value={agentInstructions}
                  onChange={(e) => setAgentInstructions(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
              <Button onClick={handleSaveInstructions}>Save Instructions</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}