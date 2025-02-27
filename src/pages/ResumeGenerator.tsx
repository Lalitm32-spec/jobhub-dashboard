
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { Text, CheckCheck, ArrowDownWideNarrow, Mail, Upload, RefreshCw, FileText } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RESUME_ACTIONS = [
  {
    text: "Optimize for ATS",
    icon: Text,
    colors: {
      icon: "text-blue-600",
      border: "border-blue-500",
      bg: "bg-blue-100",
    },
  },
  {
    text: "Improve Content",
    icon: CheckCheck,
    colors: {
      icon: "text-green-600",
      border: "border-green-500",
      bg: "bg-green-100",
    },
  },
  {
    text: "Make Concise",
    icon: ArrowDownWideNarrow,
    colors: {
      icon: "text-purple-600",
      border: "border-purple-500",
      bg: "bg-purple-100",
    },
  },
];

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
  const [activeTab, setActiveTab] = useState("optimize");

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
      setActiveTab("optimize");
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
        setActiveTab("cover-letter");
      } else {
        setColdEmail(data.generatedText);
        toast.success("Cold email generated successfully!");
        setActiveTab("cold-email");
      }
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

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Resume Generator</CardTitle>
          <CardDescription>
            Paste your resume content and job description to optimize your resume and generate tailored content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Job Description</h3>
              <Textarea 
                placeholder="Paste the job description here..." 
                className="min-h-[150px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
            
            {/* Resume Input */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Your Resume</h3>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Paste your resume content here..." 
                  className="min-h-[150px]"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Or upload your resume</span>
                    {resumeFilePath && (
                      <span className="text-sm text-green-600">Resume uploaded</span>
                    )}
                  </div>
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
                </div>
              </div>
            </div>
          </div>
          
          {/* Options Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tone" />
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
            
            {/* Recipient Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Name (Optional)</label>
              <Textarea 
                placeholder="Hiring Manager's name (if known)"
                className="min-h-[40px] resize-none"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            
            {/* Company Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name (Optional)</label>
              <Textarea 
                placeholder="Company name"
                className="min-h-[40px] resize-none"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
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
              {optimizeResumeMutation.isPending ? "Optimizing..." : "Optimize Resume"}
            </Button>
            
            <Button 
              onClick={handleGenerateCoverLetter}
              disabled={generateContentMutation.isPending || !jobDescription.trim() || (!resumeText.trim() && !resumeFilePath && !optimizedResume)}
              variant="outline"
              className="gap-2"
            >
              {generateContentMutation.isPending && generateContentMutation.variables === 'cover-letter' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Text className="h-4 w-4" />
              )}
              {generateContentMutation.isPending && generateContentMutation.variables === 'cover-letter' 
                ? "Generating..." 
                : "Generate Cover Letter"}
            </Button>
            
            <Button 
              onClick={handleGenerateColdEmail}
              disabled={generateContentMutation.isPending || !jobDescription.trim() || (!resumeText.trim() && !resumeFilePath && !optimizedResume)}
              variant="outline"
              className="gap-2"
            >
              {generateContentMutation.isPending && generateContentMutation.variables === 'cold-email' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {generateContentMutation.isPending && generateContentMutation.variables === 'cold-email'
                ? "Generating..." 
                : "Generate Cold Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Output Section - Only show if there's content */}
      {(optimizedResume || coverLetter || coldEmail) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="optimize" disabled={!optimizedResume}>Optimized Resume</TabsTrigger>
                <TabsTrigger value="cover-letter" disabled={!coverLetter}>Cover Letter</TabsTrigger>
                <TabsTrigger value="cold-email" disabled={!coldEmail}>Cold Email</TabsTrigger>
              </TabsList>
              <TabsContent value="optimize" className="mt-0">
                {optimizedResume && (
                  <Textarea 
                    value={optimizedResume} 
                    onChange={(e) => setOptimizedResume(e.target.value)}
                    className="min-h-[400px] whitespace-pre-wrap font-mono"
                  />
                )}
              </TabsContent>
              <TabsContent value="cover-letter" className="mt-0">
                {coverLetter && (
                  <Textarea 
                    value={coverLetter} 
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[400px] whitespace-pre-wrap font-mono"
                  />
                )}
              </TabsContent>
              <TabsContent value="cold-email" className="mt-0">
                {coldEmail && (
                  <Textarea 
                    value={coldEmail} 
                    onChange={(e) => setColdEmail(e.target.value)}
                    className="min-h-[400px] whitespace-pre-wrap font-mono"
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (activeTab === "optimize" && optimizedResume) {
                  navigator.clipboard.writeText(optimizedResume);
                  toast.success("Optimized resume copied to clipboard");
                } else if (activeTab === "cover-letter" && coverLetter) {
                  navigator.clipboard.writeText(coverLetter);
                  toast.success("Cover letter copied to clipboard");
                } else if (activeTab === "cold-email" && coldEmail) {
                  navigator.clipboard.writeText(coldEmail);
                  toast.success("Cold email copied to clipboard");
                }
              }}
            >
              Copy to Clipboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
