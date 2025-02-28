
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { Text, Mail, RefreshCw, FileText, Copy, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
];

type MessageType = 
  | { type: 'system'; content: string; }
  | { type: 'user'; content: string; }
  | { type: 'bot'; content: string; }
  | { type: 'jobDescription'; content: string; }
  | { type: 'resume'; content: string; filePath?: string; }
  | { type: 'result'; content: string; resultType: 'resume' | 'coverLetter' | 'coldEmail'; };

export default function ResumeGenerator() {
  // State for inputs
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFilePath, setResumeFilePath] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");
  
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
      setShowChat(true);
      
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
      setShowChat(true);

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
    setShowChat(true);
    
    // Add the resume to the chat
    setMessages(prev => [...prev, 
      { type: 'user', content: 'I\'ve uploaded my resume.' },
      { type: 'resume', content: text, filePath: url }
    ]);
    
    toast.success("Resume uploaded and text extracted");
  };

  const handleInputSubmit = (value: string, withSearch: boolean) => {
    if (!value.trim()) return;
    
    setShowChat(true);
    
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
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-2">
              <Text className="w-4 h-4" />
            </div>
            <div className="bg-[#2A303C] p-3 rounded-lg max-w-[80%] text-white">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        );
        
      case 'user':
        return (
          <div key={index} className="flex items-start justify-end mb-4">
            <div className="bg-[#4B5563] text-white p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        );
        
      case 'jobDescription':
        return (
          <div key={index} className="flex items-start justify-end mb-4">
            <div className="border border-[#4B5563] bg-[#1F2937] p-3 rounded-lg max-w-[80%] text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Job Description</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-gray-400 hover:text-white" 
                  onClick={() => copyToClipboard(message.content, "Job description")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-0 text-xs flex items-center gap-1 text-gray-400 hover:text-white">
                    <ArrowRight className="h-3 w-3" />
                    View full description
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-xs whitespace-pre-wrap mt-2 text-gray-300">{message.content}</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        );
        
      case 'resume':
        return (
          <div key={index} className="flex items-start justify-end mb-4">
            <div className="border border-[#4B5563] bg-[#1F2937] p-3 rounded-lg max-w-[80%] text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Resume</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 text-gray-400 hover:text-white" 
                  onClick={() => copyToClipboard(message.content, "Resume")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-0 text-xs flex items-center gap-1 text-gray-400 hover:text-white">
                    <ArrowRight className="h-3 w-3" />
                    View full resume
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-xs whitespace-pre-wrap mt-2 text-gray-300">{message.content}</p>
                </CollapsibleContent>
              </Collapsible>
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
    <div className="min-h-screen p-6 bg-[#0c0c0c]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-white mb-4">
            Resume Generator
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            Optimize your resume, create cover letters and cold emails tailored to specific job descriptions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column - User inputs and chat */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1F2937] border-[#4B5563] mb-6 rounded-xl overflow-hidden shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center mb-6">
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger className="bg-[#1F2937] border-[#4B5563] text-white w-full">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1F2937] border-[#4B5563] text-white">
                      {TONE_OPTIONS.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value} className="focus:bg-[#2A303C] focus:text-white">
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Status indicators */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Card className={`border ${resumeText || resumeFilePath ? 'border-green-500 bg-green-500/10' : 'border-[#4B5563] bg-[#2A303C]'} p-3 rounded-lg flex items-center`}>
                    <CheckCircle2 className={`h-5 w-5 mr-2 ${resumeText || resumeFilePath ? 'text-green-500' : 'text-gray-500'}`} />
                    <span className="text-sm text-white">Resume</span>
                  </Card>
                  
                  <Card className={`border ${jobDescription ? 'border-green-500 bg-green-500/10' : 'border-[#4B5563] bg-[#2A303C]'} p-3 rounded-lg flex items-center`}>
                    <CheckCircle2 className={`h-5 w-5 mr-2 ${jobDescription ? 'text-green-500' : 'text-gray-500'}`} />
                    <span className="text-sm text-white">Job Description</span>
                  </Card>
                </div>
                
                {/* AI Input */}
                <AIInputWithSearch 
                  placeholder="Upload resume or paste job description..."
                  onSubmit={handleInputSubmit}
                  onFileSelect={handleFileSubmit}
                  className="py-0"
                />
                
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                  <DialogContent className="bg-[#1F2937] border-[#4B5563] text-white">
                    <DialogHeader>
                      <DialogTitle>Upload Resume</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Upload your resume file or paste the content
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-white">Paste resume content</Label>
                        <Textarea 
                          placeholder="Paste your resume content here..." 
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          className="min-h-[200px] bg-[#111827] border-[#4B5563] text-gray-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Or upload a file</Label>
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
                              setShowChat(true);
                              
                              // Auto-optimize if job description is available
                              if (jobDescription.trim()) {
                                optimizeResumeMutation.mutate();
                              }
                            } else {
                              toast.error("Please enter your resume content");
                            }
                          }}
                          disabled={!resumeText.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Use Text Resume
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Chat Area - only shown when needed */}
                {showChat && (
                  <Card className="mt-6 bg-[#111827] border-[#2A303C] rounded-lg overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-[#2A303C] border-b border-[#4B5563]">
                      <CardTitle className="text-sm font-medium text-white">Chat Assistant</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <ScrollArea className="h-[250px]">
                        <div className="space-y-4">
                          {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                              Start a conversation to get help with your resume.
                            </div>
                          ) : (
                            messages.map(renderMessage)
                          )}
                          <div ref={chatEndRef} />
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                
                {/* Recipient info if needed */}
                {(activeTab === "email" || coldEmail) && (
                  <Card className="mt-6 bg-[#111827] border-[#2A303C] rounded-lg overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-[#2A303C] border-b border-[#4B5563]">
                      <CardTitle className="text-sm font-medium text-white">Email Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Recipient Name</Label>
                        <Textarea 
                          placeholder="Hiring Manager's name" 
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="min-h-[40px] bg-[#1F2937] border-[#4B5563] text-gray-200"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-white">Company Name</Label>
                        <Textarea 
                          placeholder="Company name" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="min-h-[40px] bg-[#1F2937] border-[#4B5563] text-gray-200"
                        />
                      </div>
                      
                      <Button 
                        onClick={() => generateContentMutation.mutate('cold-email')}
                        disabled={generateContentMutation.isPending || !canGenerateContent}
                        className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        {generateContentMutation.isPending && generateContentMutation.variables === 'cold-email' ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        Regenerate Email
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Generated content */}
          <div className="lg:col-span-3">
            <Card className="bg-[#1F2937] border-[#4B5563] rounded-xl overflow-hidden shadow-lg h-full">
              <CardHeader className="py-3 px-6 bg-[#2A303C] border-b border-[#4B5563]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-white">Generated Content</CardTitle>
                  
                  <div className="flex items-center gap-2">
                    {isGenerating && <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />}
                    {(optimizedResume || coverLetter || coldEmail) && !isGenerating && 
                      <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {optimizedResume || coverLetter || coldEmail ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b border-[#4B5563]">
                      <TabsList className="bg-[#1F2937] border-b border-[#4B5563] w-full justify-start rounded-none h-12 px-4">
                        <TabsTrigger 
                          value="resume" 
                          disabled={!optimizedResume}
                          className="data-[state=active]:bg-[#2A303C] data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:rounded-none data-[state=active]:shadow-none text-white"
                        >
                          Optimized Resume
                        </TabsTrigger>
                        <TabsTrigger 
                          value="coverLetter" 
                          disabled={!coverLetter}
                          className="data-[state=active]:bg-[#2A303C] data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:rounded-none data-[state=active]:shadow-none text-white"
                        >
                          Cover Letter
                        </TabsTrigger>
                        <TabsTrigger 
                          value="email" 
                          disabled={!coldEmail}
                          className="data-[state=active]:bg-[#2A303C] data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:rounded-none data-[state=active]:shadow-none text-white"
                        >
                          Cold Email
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="resume" className="m-0 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white">Optimized Resume</h3>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-white border-[#4B5563] hover:bg-[#2A303C]"
                          onClick={() => copyToClipboard(optimizedResume, "Optimized Resume")}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <Textarea 
                        value={optimizedResume}
                        onChange={(e) => setOptimizedResume(e.target.value)}
                        className="min-h-[500px] font-mono text-sm bg-[#111827] border-[#4B5563] text-gray-300 focus-visible:ring-purple-600"
                      />
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          onClick={() => optimizeResumeMutation.mutate()}
                          disabled={optimizeResumeMutation.isPending || !canOptimizeResume}
                          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {optimizeResumeMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          Regenerate Resume
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="coverLetter" className="m-0 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white">Cover Letter</h3>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-white border-[#4B5563] hover:bg-[#2A303C]"
                          onClick={() => copyToClipboard(coverLetter, "Cover Letter")}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <Textarea 
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="min-h-[500px] font-mono text-sm bg-[#111827] border-[#4B5563] text-gray-300 focus-visible:ring-purple-600"
                      />
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          onClick={() => generateContentMutation.mutate('cover-letter')}
                          disabled={generateContentMutation.isPending || !canGenerateContent}
                          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {generateContentMutation.isPending && generateContentMutation.variables === 'cover-letter' ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          Regenerate Cover Letter
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="email" className="m-0 p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white">Cold Email</h3>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-white border-[#4B5563] hover:bg-[#2A303C]"
                          onClick={() => copyToClipboard(coldEmail, "Cold Email")}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <Textarea 
                        value={coldEmail}
                        onChange={(e) => setColdEmail(e.target.value)}
                        className="min-h-[500px] font-mono text-sm bg-[#111827] border-[#4B5563] text-gray-300 focus-visible:ring-purple-600"
                      />
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          onClick={() => generateContentMutation.mutate('cold-email')}
                          disabled={generateContentMutation.isPending || !canGenerateContent}
                          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {generateContentMutation.isPending && generateContentMutation.variables === 'cold-email' ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="h-4 w-4" />
                          )}
                          Regenerate Email
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                    <FileText className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg">No content generated yet</p>
                    <p className="text-sm max-w-md text-center mt-2">
                      Upload your resume and paste a job description to optimize your resume, generate cover letters, or create cold emails.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
