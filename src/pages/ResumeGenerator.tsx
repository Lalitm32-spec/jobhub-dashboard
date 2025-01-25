import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, Send, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const ResumeGenerator = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");
  const [customResume, setCustomResume] = useState<File | null>(null);
  const [generatedContent, setGeneratedContent] = useState({
    resume: "",
    coverLetter: "",
    coldEmail: "",
  });

  const handleFileUpload = (file: File) => {
    setCustomResume(file);
    toast.success("Custom resume uploaded successfully!");
  };

  const generateContent = async (type: 'resume' | 'cover-letter' | 'cold-email') => {
    try {
      setIsGenerating(true);
      const { data: { generatedText }, error } = await supabase.functions.invoke('generate-content', {
        body: {
          jobDescription,
          type,
          resumeContent: type !== 'resume' ? generatedContent.resume : undefined,
        },
      });

      if (error) throw error;

      setGeneratedContent(prev => ({
        ...prev,
        [type === 'resume' ? 'resume' : type === 'cover-letter' ? 'coverLetter' : 'coldEmail']: generatedText,
      }));

      toast.success(`${type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} generated successfully!`);
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    // Generate resume first
    await generateContent('resume');
    // Then generate cover letter and cold email
    await generateContent('cover-letter');
    await generateContent('cold-email');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[200px] resize-none"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              
              <div className="border-t pt-4">
                <FileUpload
                  label="Optional: Upload Custom Resume"
                  acceptedFiles={['.pdf', '.docx', '.doc']}
                  description="Upload a specific resume for this application, or use your default resume from settings"
                  onFileUpload={handleFileUpload}
                />
                {!customResume && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Using default resume from settings
                  </p>
                )}
              </div>
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
                    {generatedContent.resume ? (
                      <div className="whitespace-pre-wrap">{generatedContent.resume}</div>
                    ) : (
                      <p className="text-muted-foreground">
                        Your tailored resume will appear here after generation...
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="cover-letter" className="mt-0">
                  <div className="prose max-w-none">
                    {generatedContent.coverLetter ? (
                      <div className="whitespace-pre-wrap">{generatedContent.coverLetter}</div>
                    ) : (
                      <p className="text-muted-foreground">
                        Your customized cover letter will appear here after generation...
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="cold-email" className="mt-0">
                  <div className="prose max-w-none">
                    {generatedContent.coldEmail ? (
                      <div className="whitespace-pre-wrap">{generatedContent.coldEmail}</div>
                    ) : (
                      <p className="text-muted-foreground">
                        Your cold email template will appear here after generation...
                      </p>
                    )}
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