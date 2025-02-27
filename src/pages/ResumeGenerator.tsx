import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/FileUpload";
import { Text, Mail, RefreshCw, FileText, Copy, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
const TONE_OPTIONS = [{
  value: "professional",
  label: "Professional"
}, {
  value: "conversational",
  label: "Conversational"
}, {
  value: "enthusiastic",
  label: "Enthusiastic"
}, {
  value: "formal",
  label: "Formal"
}, {
  value: "friendly",
  label: "Friendly"
}];
type MessageType = {
  type: 'system';
  content: string;
} | {
  type: 'user';
  content: string;
} | {
  type: 'bot';
  content: string;
} | {
  type: 'jobDescription';
  content: string;
} | {
  type: 'resume';
  content: string;
  filePath?: string;
} | {
  type: 'result';
  content: string;
  resultType: 'resume' | 'coverLetter' | 'coldEmail';
};
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

  // State for outputs
  const [optimizedResume, setOptimizedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [coldEmail, setColdEmail] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([{
    type: 'system',
    content: 'Welcome to the Resume Generator! I can help you optimize your resume for job applications and generate cover letters and cold emails. Get started by uploading your resume and job description.'
  }]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Query to get user's saved resume if any
  const {
    data: userProfile,
    isLoading: isLoadingProfile
  } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const {
        data: session
      } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('No user session found');
      }
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', session.session.user.id).single();
      if (error) throw error;
      return data;
    }
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
      const {
        data,
        error
      } = await supabase.functions.invoke('optimize-resume', {
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
    onSuccess: data => {
      setOptimizedResume(data.optimizedResume);
      setIsGenerating(false);

      // Add the result to chat without loading message
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'I\'ve optimized your resume based on the job description. Here\'s the result:'
      }, {
        type: 'result',
        content: data.optimizedResume,
        resultType: 'resume'
      }]);
      toast.success("Resume optimized successfully!");
    },
    onError: error => {
      console.error('Error optimizing resume:', error);
      setIsGenerating(false);

      // Add error message
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `Failed to optimize resume: ${error.message}. Please try again.`
      }]);
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
      const {
        data,
        error
      } = await supabase.functions.invoke('generate-content', {
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
      return {
        data,
        type
      };
    },
    onSuccess: result => {
      const {
        data,
        type
      } = result;
      setIsGenerating(false);
      if (type === 'cover-letter') {
        setCoverLetter(data.generatedText);

        // Add the result to chat without loading message
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'I\'ve generated a cover letter based on your resume and the job description:'
        }, {
          type: 'result',
          content: data.generatedText,
          resultType: 'coverLetter'
        }]);
        toast.success("Cover letter generated successfully!");
      } else {
        setColdEmail(data.generatedText);

        // Add the result to chat without loading message
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'I\'ve generated a cold email based on your resume and the job description:'
        }, {
          type: 'result',
          content: data.generatedText,
          resultType: 'coldEmail'
        }]);
        toast.success("Cold email generated successfully!");
      }
    },
    onError: (error, variables) => {
      console.error('Error generating content:', error);
      setIsGenerating(false);

      // Add error message without removing loading message
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `Failed to generate ${variables === 'cover-letter' ? 'cover letter' : 'cold email'}: ${error.message}. Please try again.`
      }]);
      toast.error(`Failed to generate content: ${error.message}`);
    }
  });
  const handleFileUpload = ({
    text,
    url
  }: {
    text: string;
    url: string;
  }) => {
    setResumeText(text);
    setResumeFilePath(url);
    setShowUploadDialog(false);

    // Add the resume to the chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: 'I\'ve uploaded my resume.'
    }, {
      type: 'resume',
      content: text,
      filePath: url
    }]);
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
  const handleInputSubmit = (value: string, withSearch: boolean) => {
    if (!value.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, {
      type: 'user',
      content: value
    }]);

    // Check if the input is a job description
    if (value.length > 100 && !jobDescription) {
      setJobDescription(value);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Great! I\'ve saved this as your job description.'
      }, {
        type: 'jobDescription',
        content: value
      }]);
    } else {
      // Generic response
      setMessages(prev => [...prev, {
        type: 'bot',
        content: 'Thanks for your message. You can use the buttons below to generate content based on your resume and job description.'
      }]);
    }
  };
  const handleFileSubmit = (file: File) => {
    // For simplicity, we'll just show a dialog to confirm file upload
    setShowUploadDialog(true);
  };
  const renderMessage = (message: MessageType, index: number) => {
    switch (message.type) {
      case 'system':
      case 'bot':
        return <div key={index} className="flex items-start mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-2">
              <Text className="w-4 h-4" />
            </div>
            <div className="bg-[#2A303C] p-3 rounded-lg max-w-[80%] text-white">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>;
      case 'user':
        return <div key={index} className="flex items-start justify-end mb-4">
            <div className="bg-[#4B5563] text-white p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">{message.content}</p>
            </div>
          </div>;
      case 'jobDescription':
        return <div key={index} className="flex items-start justify-end mb-4">
            <div className="border border-[#4B5563] bg-[#1F2937] p-3 rounded-lg max-w-[80%] text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Job Description</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white" onClick={() => copyToClipboard(message.content, "Job description")}>
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
          </div>;
      case 'resume':
        return <div key={index} className="flex items-start justify-end mb-4">
            <div className="border border-[#4B5563] bg-[#1F2937] p-3 rounded-lg max-w-[80%] text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Resume</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white" onClick={() => copyToClipboard(message.content, "Resume")}>
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
          </div>;
      case 'result':
        const resultTitle = message.resultType === 'resume' ? 'Optimized Resume' : message.resultType === 'coverLetter' ? 'Cover Letter' : 'Cold Email';
        return <div key={index} className="mb-4 px-4">
            <Card className="bg-[#1F2937] border border-[#4B5563] text-white">
              <CardHeader className="py-3 border-b border-[#4B5563]">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">{resultTitle}</CardTitle>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={() => copyToClipboard(message.content, resultTitle)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-3">
                <Textarea value={message.content} onChange={e => {
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
              }} className="min-h-[150px] font-mono text-sm bg-[#111827] border-[#4B5563] text-gray-300 focus-visible:ring-purple-600" />
              </CardContent>
            </Card>
          </div>;
      default:
        return null;
    }
  };
  const canOptimizeResume = jobDescription.trim() && (resumeText.trim() || resumeFilePath);
  const canGenerateContent = jobDescription.trim() && (resumeText.trim() || resumeFilePath || optimizedResume);
  return <div className="min-h-screen bg-[#111827] dark:bg-[#111827] p-6">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-white mb-4">
            Resume Generator
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Optimize your resume, create cover letters and cold emails tailored to specific job descriptions
          </p>
        </div>

        {/* Chat Messages */}
        <Card className="bg-[#1F2937] border-[#4B5563] mb-6 rounded-xl overflow-hidden shadow-lg mx-[110px]">
          <CardContent className="p-0">
            {isGenerating ? <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea> : <div className="p-4 max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                  <div ref={chatEndRef} />
                </div>
              </div>}
          </CardContent>
        </Card>
        
        {/* AI Input */}
        <AIInputWithSearch placeholder="Ask about your resume or paste job description..." onSubmit={handleInputSubmit} onFileSelect={handleFileSubmit} className="py-2" />
        
        {/* Option Buttons */}
        <div className="flex items-center justify-between mt-6 mx-[114px]">
          <div className="flex items-center gap-2">
            <Select value={selectedTone} onValueChange={setSelectedTone}>
              <SelectTrigger className="bg-[#1F2937] border-[#4B5563] text-white w-[180px]">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="bg-[#1F2937] border-[#4B5563] text-white">
                {TONE_OPTIONS.map(tone => <SelectItem key={tone.value} value={tone.value} className="focus:bg-[#2A303C] focus:text-white">
                    {tone.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            
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
                    <Textarea placeholder="Paste your resume content here..." value={resumeText} onChange={e => setResumeText(e.target.value)} className="min-h-[200px] bg-[#111827] border-[#4B5563] text-gray-200" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Or upload a file</Label>
                    <FileUpload onFileUpload={handleFileUpload} acceptedFileTypes={{
                    'application/pdf': ['.pdf'],
                    'application/msword': ['.doc'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                    'text/plain': ['.txt']
                  }} maxFileSizeMB={5} />
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => {
                    if (resumeText.trim()) {
                      setMessages(prev => [...prev, {
                        type: 'user',
                        content: 'I\'ve entered my resume.'
                      }, {
                        type: 'resume',
                        content: resumeText
                      }]);
                      setShowUploadDialog(false);
                    } else {
                      toast.error("Please enter your resume content");
                    }
                  }} disabled={!resumeText.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
                      Use Text Resume
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleOptimizeResume} disabled={optimizeResumeMutation.isPending || !canOptimizeResume} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              {optimizeResumeMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Optimize Resume
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-white bg-[#1F2937] border-[#4B5563] hover:bg-[#2A303C]">
                  <Mail className="h-4 w-4" />
                  Generate Emails
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1F2937] border-[#4B5563] text-white">
                <DialogHeader>
                  <DialogTitle>Generate Email Content</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Generate cover letters and cold emails
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-white">Recipient Name (Optional)</Label>
                    <Textarea placeholder="Hiring Manager's name" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="min-h-[40px] bg-[#111827] border-[#4B5563] text-gray-200" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Company Name (Optional)</Label>
                    <Textarea placeholder="Company name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="min-h-[40px] bg-[#111827] border-[#4B5563] text-gray-200" />
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button onClick={handleGenerateColdEmail} disabled={generateContentMutation.isPending || !canGenerateContent} variant="outline" className="gap-2 text-white bg-[#1F2937] border-[#4B5563] hover:bg-[#2A303C]">
                      {generateContentMutation.isPending && generateContentMutation.variables === 'cold-email' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      Generate Cold Email
                    </Button>
                    
                    <Button onClick={handleGenerateCoverLetter} disabled={generateContentMutation.isPending || !canGenerateContent} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                      {generateContentMutation.isPending && generateContentMutation.variables === 'cover-letter' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Text className="h-4 w-4" />}
                      Generate Cover Letter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>;
}