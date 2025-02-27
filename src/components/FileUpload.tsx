
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File as FileIcon } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onFileUpload?: (result: { text: string, url: string }) => void;
  acceptedFileTypes?: Record<string, string[]>;
  maxFileSizeMB?: number;
}

export const FileUpload = ({ 
  onFileUpload, 
  acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
  },
  maxFileSizeMB = 2
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      try {
        setIsUploading(true);
        const file = acceptedFiles[0];
        
        // Check file size
        if (file.size > maxFileSizeMB * 1024 * 1024) {
          toast.error(`File size exceeds the maximum limit of ${maxFileSizeMB}MB`);
          return;
        }
        
        setFile(file);
        
        // Upload to Supabase Storage
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user?.id;
        
        if (!userId) {
          toast.error("User not authenticated. Please login to upload files.");
          return;
        }
        
        // Create a safe filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('resumes')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error('Error uploading file:', error);
          toast.error(`Failed to upload file: ${error.message}`);
          return;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
          
        // Extract text from file
        let text = '';
        
        if (file.type === 'application/pdf') {
          // For PDFs, we'd need to extract text via a server function
          // Simplified approach here:
          text = 'PDF text extraction would be handled server-side';
          
          // In a real implementation, you might call a server function to extract text
          // const { data: extractedText, error: extractError } = await supabase.functions.invoke('extract-pdf-text', {
          //   body: { filePath: fileName }
          // });
          // if (!extractError) text = extractedText.text;
        } else {
          // For text-based files, read directly
          text = await file.text();
        }
        
        // Call the callback with text and URL
        if (onFileUpload) {
          onFileUpload({
            text,
            url: fileName
          });
        }
        
        toast.success("File uploaded successfully!");
      } catch (err) {
        console.error('Error in file upload process:', err);
        toast.error("Failed to process file");
      } finally {
        setIsUploading(false);
      }
    }
  }, [onFileUpload, maxFileSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 py-2">
            <Upload className="h-6 w-6 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive 
                ? "Drop the file here..." 
                : "Drag & drop your resume, or click to select"}
            </p>
            <p className="text-xs text-gray-400">
              Max size: {maxFileSizeMB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <FileIcon className="h-6 w-6 text-primary" />
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            className="text-gray-400 hover:text-red-500"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
