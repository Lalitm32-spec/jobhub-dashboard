import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, Send, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FileUpload } from "@/components/FileUpload";
import { supabase } from "@/integrations/supabase/client";

export const ResumeGenerator = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState({
    resume: "",
    coverLetter: "",
    coldEmail: "",
  });

  const handleFileUpload = async (file: File) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error("Please sign in to upload a resume");
        return;
      }

      const filePath = `${user.data.user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Failed to upload resume");
        return;
      }

      setResumePath(filePath);
      toast.success("Resume uploaded successfully!");
      return filePath;
    } catch (error) {
      console.error('File upload error:', error);
      toast.error("Failed to upload resume");
    }
  };

  const generateContent = async () => {
    if (!resumePath) {
      toast.error("Please upload your resume first");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    try {
      setIsGenerating(true);
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        toast.error("Please sign in to generate content");
        return;
      }

      const { data, error } = await supabase.functions.invoke('optimize-resume', {
        body: { resumePath, jobDescription },
      });

      if (error) {
        console.error('Generation error:', error);
        // Check for quota exceeded error
        if (error.message.includes('quota exceeded') || error.message.includes('RESOURCE_EXHAUSTED')) {
          toast.error("API quota exceeded. Please try again later.");
          return;
        }
        throw error;
      }

      const { optimizedResume, coverLetter, coldEmail } = data;

      setGeneratedContent({
        resume: optimizedResume,
        coverLetter: coverLetter,
        coldEmail: coldEmail,
      });

      await supabase.from('resume_optimizations').insert({
        user_id: user.data.user.id,
        original_resume_path: resumePath,
        job_description: jobDescription,
        cover_letter: coverLetter,
        cold_email: coldEmail,
      });

      toast.success("Content generated successfully!");
    } catch (error) {
      console.error('Error generating content:', error);
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
            <CardTitle>Resume Optimization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <FileUpload
                label="Upload Your Resume"
                acceptedFiles={['.pdf', '.docx', '.doc']}
                description="Upload your existing resume"
                onFileUpload={handleFileUpload}
              />
              
              <div className="space-y-2">
                <label htmlFor="jobDescription" className="text-sm font-medium">
                  Job Description
                </label>
                <textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={generateContent}
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
            <Tabs defaultValue="resume" value={activeTab} onValueChange={setActiveTab}>
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
                        Your optimized resume will appear here after generation...
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