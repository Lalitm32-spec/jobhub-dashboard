import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ResumePreviewProps {
  resumePath: string | null;
}

export const ResumePreview = ({ resumePath }: ResumePreviewProps) => {
  const getPublicUrl = (path: string) => {
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/resumes/${path}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Resume Preview</h2>
      </div>
      
      {resumePath ? (
        <div className="flex-grow p-4">
          <iframe
            src={getPublicUrl(resumePath)}
            className="w-full h-full border rounded-lg"
            title="Resume Preview"
          />
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-gray-400">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <p>Upload a resume to see the preview</p>
          </div>
        </div>
      )}
    </Card>
  );
};