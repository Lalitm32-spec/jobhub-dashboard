import { useState } from "react";
import { Card } from "@/components/ui/card";
import { NewsletterStyle } from "@/components/resume-generator/NewsletterStyle";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const ResumeGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumePath, setResumePath] = useState<string | null>(null);

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
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      console.error('File upload error:', error);
      toast.error("Failed to upload resume");
    }
  };

  const handleGenerate = async () => {
    if (!resumePath) {
      toast.error("Please upload your resume first");
      return;
    }

    setIsGenerating(true);
    try {
      // Add generation logic here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      toast.success("Resume generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Failed to generate resume");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6 bg-white shadow-lg rounded-xl">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Resume Generator
              </h1>
              <p className="mt-2 text-gray-600">
                Upload your resume and let AI optimize it for you
              </p>
            </div>

            <div className="space-y-4">
              <FileUpload
                label="Upload Your Resume"
                acceptedFiles={['.pdf', '.docx', '.doc']}
                description="Upload your existing resume"
                onFileUpload={handleFileUpload}
              />

              <Button
                className="w-full"
                onClick={handleGenerate}
                disabled={isGenerating || !resumePath}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        <NewsletterStyle />
      </div>
    </div>
  );
};

export default ResumeGenerator;
