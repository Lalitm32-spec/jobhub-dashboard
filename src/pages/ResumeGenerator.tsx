import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, Send, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const ResumeGenerator = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");
  const [apiKey, setApiKey] = useState("");

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    if (!apiKey) {
      toast.error("Please enter your Perplexity API key");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a professional resume and cover letter writer.'
            },
            {
              role: 'user',
              content: `Generate a professional response for this job description: ${jobDescription}`
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      toast.success("Content generated successfully!");
    } catch (error) {
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[200px] resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <input
                type="password"
                placeholder="Enter your Perplexity API key"
                className="w-full px-3 py-2 border rounded-md"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resume" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="resume">
                  <FileUp className="mr-2 h-4 w-4" />
                  Resume
                </TabsTrigger>
                <TabsTrigger value="cover-letter">
                  <FileText className="mr-2 h-4 w-4" />
                  Cover Letter
                </TabsTrigger>
                <TabsTrigger value="cold-email">
                  <Mail className="mr-2 h-4 w-4" />
                  Cold Email
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="h-[400px] mt-4 rounded-md border p-4">
                <TabsContent value="resume" className="mt-0">
                  <div className="prose max-w-none">
                    <h3>Tailored Resume</h3>
                    <p className="text-muted-foreground">
                      Your tailored resume will appear here after generation...
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="cover-letter" className="mt-0">
                  <div className="prose max-w-none">
                    <h3>Cover Letter</h3>
                    <p className="text-muted-foreground">
                      Your customized cover letter will appear here after generation...
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="cold-email" className="mt-0">
                  <div className="prose max-w-none">
                    <h3>Cold Email Template</h3>
                    <p className="text-muted-foreground">
                      Your cold email template will appear here after generation...
                    </p>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeGenerator;