
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { Text, Mail, RefreshCw, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/ThemeProvider";

type MessageType = 
  | { type: 'system'; content: string; }
  | { type: 'user'; content: string; }
  | { type: 'bot'; content: string; }
  | { type: 'jobDescription'; content: string; }
  | { type: 'resume'; content: string; filePath?: string; };

export default function ResumeGenerator() {
  const { theme } = useTheme();
  
  // State for inputs
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFilePath, setResumeFilePath] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // State for outputs
  const [optimizedResume, setOptimizedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [coldEmail, setColdEmail] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

      setIsGenerating(true);
      
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
      setIsGenerating(false);
      setHasGenerated(true);
      setActiveTab("resume");
      
      // Add the result to chat
      setMessages(prev => [
        ...prev,
        { 
          type: 'bot', 
          content: 'I\'ve optimized your resume based on the job description.' 
        }
      ]);
      
      toast.success("Resume optimized successfully!");
    },
    onError: (error) => {
      console.error('Error optimizing resume:', error);
      setIsGenerating(false);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        { 
          type: 'bot', 
          content: `Failed to optimize resume: ${error.message}. Please try again.` 
        }
      ]);
      
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

      setIsGenerating(true);

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
      return { data, type };
    },
    onSuccess: (result) => {
      const { data, type } = result;
      setIsGenerating(false);
      setHasGenerated(true);
      
      if (type === 'cover-letter') {
        setCoverLetter(data.generatedText);
        setActiveTab("coverLetter");
        
        // Add the result to chat
        setMessages(prev => [
          ...prev,
          { 
            type: 'bot', 
            content: 'I\'ve generated a cover letter based on your resume and the job description.' 
          }
        ]);
        
        toast.success("Cover letter generated successfully!");
      } else {
        setColdEmail(data.generatedText);
        setActiveTab("email");
        
        // Add the result to chat
        setMessages(prev => [
          ...prev,
          { 
            type: 'bot', 
            content: 'I\'ve generated a cold email based on your resume and the job description.' 
          }
        ]);
        
        toast.success("Cold email generated successfully!");
      }
    },
    onError: (error, variables) => {
      console.error('Error generating content:', error);
      setIsGenerating(false);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        { 
          type: 'bot', 
          content: `Failed to generate ${variables === 'cover-letter' ? 'cover letter' : 'cold email'}: ${error.message}. Please try again.` 
        }
      ]);
      
      toast.error(`Failed to generate content: ${error.message}`);
    }
  });

  const handleFileUpload = ({ text, url }: { text: string, url: string }) => {
    setResumeText(text);
    setResumeFilePath(url);
    setShowUploadDialog(false);
    
    // Add the resume to the chat
    setMessages(prev => [...prev, 
      { type: 'user', content: 'I\'ve uploaded my resume.' },
      { type: 'resume', content: text, filePath: url }
    ]);
    
    toast.success("Resume uploaded and text extracted");
    
    // Auto-optimize if job description is available
    if (jobDescription.trim()) {
      optimizeResumeMutation.mutate();
    }
  };

  const handleInputSubmit = (value: string, withSearch: boolean) => {
    if (!value.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: value }]);
    
    // Check if the input is a job description
    if (value.length > 100 && !jobDescription) {
      setJobDescription(value);
      setMessages(prev => [...prev, 
        { type: 'bot', content: 'Great! I\'ve saved this as your job description.' },
        { type: 'jobDescription', content: value }
      ]);
      
      // Auto-optimize resume if job description and resume are both available
      if (resumeText.trim() || resumeFilePath) {
        optimizeResumeMutation.mutate();
      }
    } else if (value.toLowerCase().includes("cover letter") || value.toLowerCase().includes("coverletter")) {
      // Auto-generate cover letter
      if (canGenerateContent) {
        generateContentMutation.mutate('cover-letter');
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'To generate a cover letter, I need both your resume and a job description. Please provide those first.' 
        }]);
      }
    } else if (value.toLowerCase().includes("cold email") || value.toLowerCase().includes("email")) {
      // Auto-generate cold email
      if (canGenerateContent) {
        generateContentMutation.mutate('cold-email');
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'To generate a cold email, I need both your resume and a job description. Please provide those first.' 
        }]);
      }
    } else if (value.toLowerCase().includes("optimize") || value.toLowerCase().includes("resume")) {
      // Auto-optimize resume
      if (canOptimizeResume) {
        optimizeResumeMutation.mutate();
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'To optimize your resume, I need both your resume and a job description. Please provide those first.' 
        }]);
      }
    } else {
      // Generic response
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'I can help you optimize your resume, generate cover letters, or create cold emails. Just upload your resume and provide a job description, or ask for what you need.' 
      }]);
    }
  };
  
  const handleFileSubmit = (file: File) => {
    setShowUploadDialog(true);
  };
  
  const renderMessage = (message: MessageType, index: number) => {
    switch (message.type) {
      case 'system':
      case 'bot':
        return (
          <div key={index} className="flex items-start mb-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
              <Text className="w-4 h-4" />
            </div>
            <div className="bg-muted p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        );
        
      case 'user':
        return (
          <div key={index} className="flex items-start justify-end mb-4">
            <div className="bg-accent p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        );
        
      case 'jobDescription':
      case 'resume':
        return (
          <div key={index} className="flex items-start justify-end mb-4">
            <div className="bg-accent p-3 rounded-lg max-w-[80%]">
              <p className="text-sm font-medium mb-1">
                {message.type === 'jobDescription' ? 'Job Description' : 'Resume'} uploaded
              </p>
              <p className="text-xs opacity-75">
                {message.type === 'jobDescription' 
                  ? 'Your job description has been saved.' 
                  : 'Your resume has been processed.'}
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const canOptimizeResume = jobDescription.trim() && (resumeText.trim() || resumeFilePath);
  const canGenerateContent = jobDescription.trim() && (resumeText.trim() || resumeFilePath || optimizedResume);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        {/* AI Chat Section - Now fills the left side of the screen */}
        <div className="md:w-1/2 flex flex-col">
          <div className="p-6 flex-shrink-0">
            <h1 className="text-3xl font-medium mb-3 text-foreground" style={{ fontFamily: 'cursive' }}>
              Resume Generator
            </h1>
            <p className="text-muted-foreground mb-4">
              Optimize your resume, create cover letters and cold emails tailored to specific job descriptions
            </p>
          </div>

          {/* Chat Messages Area - Now takes full height */}
          <div className="flex-grow relative overflow-hidden px-6 pb-6">
            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="px-4 pb-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Text className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Upload your resume or paste a job description to get started.</p>
                    <p className="text-sm mt-2">I'll help you optimize your resume and create personalized content.</p>
                  </div>
                )}
                {messages.map(renderMessage)}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="p-6 border-t border-border">
            <AIInputWithSearch 
              placeholder="Upload resume or paste job description..."
              onSubmit={handleInputSubmit}
              onFileSelect={handleFileSubmit}
              className="w-full"
            />
          </div>
        </div>

        {/* Content Tabs Section - Now fills the right side */}
        <div className="md:w-1/2 border-l border-border flex flex-col">
          {!hasGenerated ? (
            <div className="flex items-center justify-center h-full">
              <div className="max-w-md text-center p-8">
                <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h2 className="text-xl font-medium mb-2">No content generated yet</h2>
                <p className="text-muted-foreground mb-4">
                  Upload your resume and a job description to generate optimized content.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadDialog(true)}
                >
                  Upload Resume
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4 w-full">
                    <TabsTrigger value="resume" disabled={!optimizedResume} className="rounded-full">
                      Resume
                    </TabsTrigger>
                    <TabsTrigger value="coverLetter" disabled={!coverLetter} className="rounded-full">
                      Cover Letter
                    </TabsTrigger>
                    <TabsTrigger value="email" disabled={!coldEmail} className="rounded-full">
                      Cold Email
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex-grow overflow-y-auto p-6">
                <TabsContent value="resume" className="h-full mt-0">
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Optimized Resume</h3>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => copyToClipboard(optimizedResume, "Optimized Resume")}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <Textarea 
                      value={optimizedResume}
                      onChange={(e) => setOptimizedResume(e.target.value)}
                      className="min-h-[calc(100vh-350px)] text-sm w-full flex-grow"
                    />
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => optimizeResumeMutation.mutate()}
                        disabled={optimizeResumeMutation.isPending || !canOptimizeResume}
                        className="gap-2"
                      >
                        {optimizeResumeMutation.isPending ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="coverLetter" className="h-full mt-0">
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Cover Letter</h3>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => copyToClipboard(coverLetter, "Cover Letter")}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <Textarea 
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="min-h-[calc(100vh-350px)] text-sm w-full flex-grow"
                    />
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => generateContentMutation.mutate('cover-letter')}
                        disabled={generateContentMutation.isPending || !canGenerateContent}
                        className="gap-2"
                      >
                        {generateContentMutation.isPending && generateContentMutation.variables === 'cover-letter' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="email" className="h-full mt-0">
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Cold Email</h3>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => copyToClipboard(coldEmail, "Cold Email")}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <Label>Recipient Name</Label>
                        <Textarea 
                          placeholder="Hiring Manager's name" 
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="min-h-[40px]"
                        />
                      </div>
                      <div>
                        <Label>Company Name</Label>
                        <Textarea 
                          placeholder="Company name" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="min-h-[40px]"
                        />
                      </div>
                    </div>
                    
                    <Textarea 
                      value={coldEmail}
                      onChange={(e) => setColdEmail(e.target.value)}
                      className="min-h-[calc(100vh-450px)] text-sm w-full flex-grow"
                    />
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => generateContentMutation.mutate('cold-email')}
                        disabled={generateContentMutation.isPending || !canGenerateContent}
                        className="gap-2"
                      >
                        {generateContentMutation.isPending && generateContentMutation.variables === 'cold-email' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          )}
        </div>
      </div>
                    
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload your resume file or paste the content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Paste resume content</Label>
              <Textarea 
                placeholder="Paste your resume content here..." 
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Or upload a file</Label>
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
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={() => {
                  if (resumeText.trim()) {
                    setMessages(prev => [...prev, 
                      { type: 'user', content: 'I\'ve entered my resume.' },
                      { type: 'resume', content: resumeText }
                    ]);
                    setShowUploadDialog(false);
                    
                    // Auto-optimize if job description is available
                    if (jobDescription.trim()) {
                      optimizeResumeMutation.mutate();
                    }
                  } else {
                    toast.error("Please enter your resume content");
                  }
                }}
                disabled={!resumeText.trim()}
              >
                Use Text Resume
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
