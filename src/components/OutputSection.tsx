import { useState } from "react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, ChevronUp, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const OutputSection = () => {
  const [isResumeGenerated, setIsResumeGenerated] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const handleCopyEmail = () => {
    // Implementation for copying email content
    toast.success("Email copied to clipboard!");
  };

  if (!isResumeGenerated) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-lg border bg-green-50 p-4">
        <p className="text-green-700 font-medium">
          Your customized resume has been generated!
        </p>
        <Button className="mt-4" onClick={() => window.open("#", "_blank")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View in Google Docs
        </Button>
      </div>

      <Collapsible>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Cover Letter</h3>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCoverLetterOpen(!isCoverLetterOpen)}
            >
              {isCoverLetterOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-4">
          <div className="rounded-lg border p-4">
            <p className="text-gray-600">
              [Cover letter preview will appear here]
            </p>
            <Button className="mt-4">Download Cover Letter</Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Cold Email</h3>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEmailOpen(!isEmailOpen)}
            >
              {isEmailOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-4">
          <div className="rounded-lg border p-4">
            <p className="text-gray-600">
              [Email content will appear here]
            </p>
            <Button className="mt-4" onClick={handleCopyEmail}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Email
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};