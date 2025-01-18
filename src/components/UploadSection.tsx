import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export const UploadSection = () => {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Upload Resume + Job Description</h3>
        <p className="mt-2 text-sm text-gray-600">
          Upload your resume and job description to start customizing
        </p>
        <Button className="mt-4">
          <Upload className="mr-2 h-4 w-4" /> Upload Files
        </Button>
      </div>
    </div>
  );
};