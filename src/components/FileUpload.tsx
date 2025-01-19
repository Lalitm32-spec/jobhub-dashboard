import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  label: string;
  acceptedFiles: string[];
  description: string;
  onFileUpload?: (file: File) => void;  // Added this prop
}

export const FileUpload = ({ label, acceptedFiles, description, onFileUpload }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      if (onFileUpload) {
        onFileUpload(acceptedFiles[0]);
      }
      toast.success("File uploaded successfully!");
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{label}</h3>
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">{description}</p>
            <p className="text-xs text-gray-400">
              Supported formats: {acceptedFiles.join(", ")}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};