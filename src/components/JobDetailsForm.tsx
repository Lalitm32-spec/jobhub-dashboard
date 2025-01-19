import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const JobDetailsForm = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [hasStoredResume, setHasStoredResume] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedResume = localStorage.getItem('userResume');
    setHasStoredResume(!!storedResume);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasStoredResume) {
      toast.error("Please upload your resume in Settings first");
      navigate("/settings");
      return;
    }

    if (!jobTitle || !companyName) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Processing your request...");
  };

  if (!hasStoredResume) {
    return (
      <div className="text-center p-6 space-y-4">
        <h2 className="text-xl font-semibold">Upload Your Resume First</h2>
        <p className="text-gray-600">Please upload your resume in the Settings page before proceeding.</p>
        <Button onClick={() => navigate("/settings")}>Go to Settings</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Job Details</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="jobTitle" className="text-sm font-medium">
            Job Title
          </label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Software Engineer"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="companyName" className="text-sm font-medium">
            Company Name
          </label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Google"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="jobDescription" className="text-sm font-medium">
          Job Description
        </label>
        <Textarea
          id="jobDescription"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here"
          className="h-32"
          required
        />
      </div>
      <Button type="submit" className="w-full md:w-auto">
        Customize Resume
      </Button>
    </form>
  );
};