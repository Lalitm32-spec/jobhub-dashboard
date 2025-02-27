
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { Text, CheckCheck, ArrowDownWideNarrow, Mail, Upload, RefreshCw, FileText, Copy, Plus, ChevronDown, ChevronRight, PaperclipIcon, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [userInput, setUserInput] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  // State for outputs
  const [optimizedResume, setOptimizedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [coldEmail, setColdEmail] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([
    { 
      type: 'system', 
      content: 'Welcome to the Resume Generator! I can help you optimize your resume for job applications and generate cover letters and cold emails. Get started by uploading your resume and job description.' 
    }
  ]);
  
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

      // Add a loading message
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Optimizing your resume... This may take a moment.' 
      }]);

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
      
      // Add the result to chat
      setMessages(prev => [
        ...prev.filter(m => m.content !== 'Optimizing your resume... This may take a moment.'), 
        { 
          type: 'bot', 
          content: 'I\'ve optimized your resume based on the job description. Here\'s the result:' 
        },
        {
          type: 'result',
          content: data.optimizedResume,
          resultType: 'resume'
        }
      ]);
      
      toast.success("Resume optimized successfully!");
    },
    onError: (error) => {
      console.error('Error optimizing resume:', error);
      
      // Remove loading message and add error message
      setMessages(prev => [
        ...prev.filter(m => m.content !== 'Optimizing your resume... This may take a moment.'),
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

      // Add a loading message
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `Generating ${type === 'cover-letter' ? 'cover letter' : 'cold email'}... This may take a moment.` 
      }]);

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
      
      if (type === 'cover-letter') {
        setCoverLetter(data.generatedText);
        
        // Add the result to chat
        setMessages(prev => [
          ...prev.filter(m => m.content !== 'Generating cover letter... This may take a moment.'),
          { 
            type: 'bot', 
            content: 'I\'ve generated a cover letter based on your resume and the job description:' 
          },
          {
            type: 'result',
            content: data.generatedText,
            resultType: 'coverLetter'
          }
        ]);
        
        toast.success("Cover letter generated successfully!");
      } else {
        setColdEmail(data.generatedText);
        
        // Add the result to chat
        setMessages(prev => [
          ...prev.filter(m => m.content !== 'Generating cold email... This may take a moment.'),
          { 
            type: 'bot', 
            content: 'I\'ve generated a cold email based on your resume and the job description:' 
          },
          {
            type: 'result',
            content: data.generatedText,
            resultType: 'coldEmail'
          }
        ]);
        
        toast.success("Cold email generated successfully!");
      }
    },
    onError: (error, variables) => {
      console.error('Error generating content:', error);
      
      // Remove loading message and add error message
      setMessages(prev => [
        ...prev.filter(m => m.content !== `Generating ${variables === 'cover-letter' ? 'cover letter' : 'cold email'}... This may take a moment.`),
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
  
  const handleUserInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: userInput }]);
    
    // Check if the input is a job description
    if (userInput.length > 100 && !jobDescription) {
      setJobDescription(userInput);
      setMessages(prev => [...prev, 
        { type: 'bot', content: 'Great! I\'ve saved this as your job description.' },
        { type: 'jobDescription', content: userInput }
      ]);
    } else {
      // Generic response
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Thanks for your message. You can use the buttons below to generate content based on your resume and job description.' 
      }]);
    }
    
    setUserInput('');
  };
  
  const handleSendJobDescription = () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first");
      return;
    }
    
    setMessages(prev => [...prev, 
      { type: 'user', content: 'Here\'s the job description I\'m applying for:' },
      { type: 'jobDescription', content: jobDescription }
    ]);
  };
  
  const handleSendResume = () => {
    if (!resumeText.trim()) {
      toast.error("Please enter your resume content first");
      return;
    }
    
    setMessages(prev => [...prev, 
      { type: 'user', content: 'Here\'s my resume:' },
      { type: 'resume', content: resumeText }
    ]);
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
            <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        );
        
      case 'jobDescription':
        return (
          <div key={index} className="flex items-start justify-end mb-4">
            <div className="border border-border bg-card p-3 rounded-lg max-w-[80%]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Job Description</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={() => copyToClipboard(message.content, "Job description")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-0 text-xs flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    View full description
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-xs whitespace-pre-wrap mt-2">{message.content}</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        );
        
      case 'resume':
        return (
          <div key={index} className="flex items-start justify-end mb-4">
            <div className="border border-border bg-card p-3 rounded-lg max-w-[80%]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Resume</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={() => copyToClipboard(message.content, "Resume")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-0 text-xs flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    View full resume
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <p className="text-xs whitespace-pre-wrap mt-2">{message.content}</p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        );
        
      case 'result':
        const resultTitle = message.resultType === 'resume' 
          ? 'Optimized Resume' 
          : message.resultType === 'coverLetter' 
            ? 'Cover Letter' 
            : 'Cold Email';
        
        return (
          <div key={index} className="mb-4 px-4">
            <Card>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{resultTitle}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(message.content, resultTitle)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-0">
                <Textarea 
                  value={message.content}
                  onChange={(e) => {
                    // Update the corresponding state
                    if (message.resultType === 'resume') {
                      setOptimizedResume(e.target.value);
                    } else if (message.resultType === 'coverLetter') {
                      setCoverLetter(e.target.value);
                    } else {
                      setColdEmail(e.target.value);
                    }
                    
                    // Update the message in the messages array
                    const newMessages = [...messages];
                    newMessages[index] = {
                      ...message,
                      content: e.target.value
                    };
                    setMessages(newMessages);
                  }}
                  className="min-h-[150px] font-mono text-sm mt-2"
                />
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  const canOptimizeResume = jobDescription.trim() && (resumeText.trim() || resumeFilePath);
  const canGenerateContent = jobDescription.trim() && (resumeText.trim() || resumeFilePath || optimizedResume);

  return (
    <div className="container max-w-4xl mx-auto py-4 flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Resume Generator</h1>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTone} onValueChange={setSelectedTone}>
            <SelectTrigger className="w-[150px]">
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
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <PaperclipIcon className="h-5 w-5" />
              </Button>
            </DialogTrigger>
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Additional Information</DialogTitle>
                <DialogDescription>
                  Add more details to personalize your content
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea 
                    id="jobDescription"
                    placeholder="Paste job description here..." 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleSendJobDescription}
                    disabled={!jobDescription.trim()}
                    className="mt-1"
                  >
                    Send to Chat
                  </Button>
                </div>
                
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
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Chat Messages */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map(renderMessage)}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
      </Card>
      
      {/* Input Area */}
      <Card className="mt-4">
        <CardContent className="p-3">
          <div className="flex flex-col gap-3">
            <form onSubmit={handleUserInputSubmit} className="relative flex items-center">
              <Textarea 
                placeholder="Type your message or paste job description..." 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-[60px] pr-10 resize-none"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-4"
                disabled={!userInput.trim()}
              >
                <SendHorizontal className="h-5 w-5" />
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleOptimizeResume}
                disabled={optimizeResumeMutation.isPending || !canOptimizeResume}
                className="gap-2"
                size="sm"
              >
                {optimizeResumeMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                Optimize Resume
              </Button>
              
              <Button 
                onClick={handleGenerateCoverLetter}
                disabled={generateContentMutation.isPending || !canGenerateContent}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                {generateContentMutation.isPending && generateContentMutation.variables === 'cover-letter' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Text className="h-4 w-4" />
                )}
                Generate Cover Letter
              </Button>
              
              <Button 
                onClick={handleGenerateColdEmail}
                disabled={generateContentMutation.isPending || !canGenerateContent}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                {generateContentMutation.isPending && generateContentMutation.variables === 'cold-email' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Generate Cold Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
