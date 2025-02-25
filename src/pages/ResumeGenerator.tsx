
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIInputWithSuggestions } from "@/components/ui/ai-input-with-suggestions";
import { Text, CheckCheck, ArrowDownWideNarrow } from "lucide-react";
import { toast } from "sonner";

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

export default function ResumeGenerator() {
  const handleSubmit = async (text: string, action?: string) => {
    try {
      // Handle the submission here
      console.log("Submitted text:", text, "with action:", action);
      toast.success("Processing your resume...");
    } catch (error) {
      console.error("Error processing resume:", error);
      toast.error("Failed to process resume. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Resume Generator</CardTitle>
          <CardDescription>
            Paste your resume content below and select an action to optimize it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIInputWithSuggestions
            actions={RESUME_ACTIONS}
            placeholder="Paste your resume content here..."
            maxHeight={400}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
