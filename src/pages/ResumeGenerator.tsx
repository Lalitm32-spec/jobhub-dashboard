import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ResumeGenerator = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeContent, setResumeContent] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'user',
        content: inputMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Call Supabase Edge Function to optimize resume
      const { data, error } = await supabase.functions.invoke('optimize-resume', {
        body: { jobDescription: inputMessage },
      });

      if (error) throw error;

      // Add assistant message with the response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setResumeContent(data.optimizedResume);
      setInputMessage('');
      toast.success('Resume updated successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 p-6">
      {/* Left side - Chat Interface */}
      <Card className="w-1/2 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Resume Updates</h2>
          <p className="text-sm text-muted-foreground">
            Enter job description to optimize your resume
          </p>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter job description..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="self-end"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Right side - Resume Preview */}
      <Card className="w-1/2 flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Resume Preview</h2>
          <p className="text-sm text-muted-foreground">
            See your optimized resume in real-time
          </p>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {resumeContent ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: resumeContent }} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">No Resume Yet</h3>
              <p className="text-sm">
                Enter a job description to optimize your resume
              </p>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ResumeGenerator;