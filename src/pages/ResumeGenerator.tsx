import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Loader2, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/components/resume-generator/ChatMessage";
import { ResumePreview } from "@/components/resume-generator/ResumePreview";

interface Message {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
}

export const ResumeGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumePath, setResumePath] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: "Upload your resume and I'll help you optimize it.",
      timestamp: new Date(),
    },
  ]);

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
      addMessage('system', "Great! I've received your resume. I'll analyze it and suggest improvements.");
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      console.error('File upload error:', error);
      toast.error("Failed to upload resume");
    }
  };

  const addMessage = (type: 'system' | 'user', content: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Left side - Chat Interface */}
      <div className="w-1/2 p-6 border-r border-gray-200">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Resume Assistant</h2>
          </div>
          
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            {!resumePath ? (
              <FileUpload
                label="Upload Your Resume"
                acceptedFiles={['.pdf', '.docx', '.doc']}
                description="Upload your existing resume"
                onFileUpload={handleFileUpload}
              />
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  setIsGenerating(true);
                  // Simulate optimization process
                  setTimeout(() => {
                    addMessage('system', "I've analyzed your resume and here are my suggestions...");
                    setIsGenerating(false);
                  }, 2000);
                }}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Optimize Resume
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Right side - Resume Preview */}
      <div className="w-1/2 p-6">
        <ResumePreview resumePath={resumePath} />
      </div>
    </div>
  );
};

export default ResumeGenerator;