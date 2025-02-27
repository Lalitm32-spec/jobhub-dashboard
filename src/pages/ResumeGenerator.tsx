
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { Text, CheckCheck, ArrowDownWideNarrow, Mail, Upload, RefreshCw, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
];

export default function ResumeGenerator() {
  // State for inputs
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFilePath, setResumeFilePath] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  // State for outputs
  const [optimizedResume, setOptimizedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [coldEmail, setColdEmail] = useState("");
  const [activeTab, setActiveTab] = useState("resume");

  // Query to get user's saved resume if any
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation for optimizing resume
  const optimizeResumeMutation = useMutation({
    mutationFn: async () => {
      if (!jobDescription.trim()) {
        throw new Error('Job description is required');
      }
      
      if (!resumeText.trim() && !resumeFilePath) {
        throw new Error('Resume content is required');
      }

      const { data, error } = await supabase.functions.invoke('optimize-resume', {
        body: {
          jobDescription,
          resumeText: resumeText.trim() || null,
          resumePath: resumeFilePath || null,
          tone: selectedTone
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setOptimizedResume(data.optimizedResume);
      toast.success("Resume optimized successfully!");
      setActiveTab("results");
    },
    onError: (error) => {
      console.error('Error optimizing resume:', error);
      toast.error(`Failed to optimize resume: ${error.message}`);
    }
  });

  // Mutation for generating content (cover letter & cold email)
  const generateContentMutation = useMutation({
    mutationFn: async (type: 'cover-letter' | 'cold-email') => {
      if (!jobDescription.trim()) {
        throw new Error('Job description is required');
      }
      
      if (!resumeText.trim() && !resumeFilePath && !optimizedResume) {
        throw new Error('Resume content is required');
      }

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          jobDescription,
          resumeText: optimizedResume || resumeText.trim() || null,
          resumePath: resumeFilePath || null,
          type,
          tone: selectedTone,
          recipientName: recipientName.trim() || null,
          companyName: companyName.trim() || null
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      if (variables === 'cover-letter') {
        setCoverLetter(data.generatedText);
        toast.success("Cover letter generated successfully!");
      } else {
        setColdEmail(data.generatedText);
        toast.success("Cold email generated successfully!");
      }
      setActiveTab("results");
    },
    onError: (error) => {
      console.error('Error generating content:', error);
      toast.error(`Failed to generate content: ${error.message}`);
    }
  });

  const handleFileUpload = ({ text, url }: { text: string, url: string }) => {
    setResumeText(text);
    setResumeFilePath(url);
    toast.success("Resume uploaded and text extracted");
  };

  const handleOptimizeResume = async () => {
    try {
      await optimizeResumeMutation.mutateAsync();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleGenerateCoverLetter = async () => {
    try {
      await generateContentMutation.mutateAsync('cover-letter');
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleGenerateColdEmail = async () => {
    try {
      await generateContentMutation.mutateAsync('cold-email');
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Resume Generator</h1>
          <div className="flex items-center space-x-2">
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="resume">Resume & Job</TabsTrigger>
            <TabsTrigger value="results">Generated Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resume" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Description Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Job Description</CardTitle>
                  <CardDescription>
                    Paste the job description you're applying for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Paste job description here..." 
                    className="min-h-[200px] font-mono text-sm"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </CardContent>
              </Card>
              
              {/* Resume Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Your Resume</CardTitle>
                  <CardDescription>
                    Paste your resume or upload a file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="Paste your resume content here..." 
                    className="min-h-[200px] font-mono text-sm"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  
                  <div className="space-y-2">
                    <Label>Or upload your resume</Label>
                    <FileUpload 
                      onFileUpload={handleFileUpload}
                      acceptedFileTypes={{
                        'application/pdf': ['.pdf'],
                        'application/msword': ['.doc'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                        'text/plain': ['.txt']
                      }}
                      maxFileSizeMB={5}
                    />
                    {resumeFilePath && (
                      <p className="text-sm text-green-600 mt-2">Resume file uploaded successfully</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Additional Information</CardTitle>
                <CardDescription>
                  Optional details to personalize your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
                    <Input 
                      id="recipientName"
                      placeholder="Hiring Manager's name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name (Optional)</Label>
                    <Input 
                      id="companyName"
                      placeholder="Company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                <Button 
                  onClick={handleGenerateColdEmail}
                  disabled={generateContentMutation.isPending || !jobDescription.trim() || (!resumeText.trim() && !resumeFilePath)}
                  variant="outline"
                  className="gap-2"
                >
                  {generateContentMutation.isPending && generateContentMutation.variables === 'cold-email' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  Generate Cold Email
                </Button>
                
                <Button 
                  onClick={handleGenerateCoverLetter}
                  disabled={generateContentMutation.isPending || !jobDescription.trim() || (!resumeText.trim() && !resumeFilePath)}
                  variant="outline"
                  className="gap-2"
                >
                  {generateContentMutation.isPending && generateContentMutation.variables === 'cover-letter' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Text className="h-4 w-4" />
                  )}
                  Generate Cover Letter
                </Button>
                
                <Button 
                  onClick={handleOptimizeResume}
                  disabled={optimizeResumeMutation.isPending || !jobDescription.trim() || (!resumeText.trim() && !resumeFilePath)}
                  className="gap-2"
                >
                  {optimizeResumeMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  Optimize Resume
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-6 pt-4">
            {(!optimizedResume && !coverLetter && !coldEmail) ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">No content generated yet. Use the Resume & Job tab to generate content.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Optimized Resume */}
                {optimizedResume && (
                  <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2">
                      <div>
                        <CardTitle className="text-xl">Optimized Resume</CardTitle>
                        <CardDescription>
                          Your resume optimized for this specific job
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(optimizedResume, "Resume")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        value={optimizedResume}
                        onChange={(e) => setOptimizedResume(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                )}
                
                {/* Cover Letter */}
                {coverLetter && (
                  <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2">
                      <div>
                        <CardTitle className="text-xl">Cover Letter</CardTitle>
                        <CardDescription>
                          Tailored cover letter for your application
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(coverLetter, "Cover letter")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                )}
                
                {/* Cold Email */}
                {coldEmail && (
                  <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2">
                      <div>
                        <CardTitle className="text-xl">Cold Email</CardTitle>
                        <CardDescription>
                          Email template for reaching out to employers
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(coldEmail, "Cold email")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        value={coldEmail}
                        onChange={(e) => setColdEmail(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
