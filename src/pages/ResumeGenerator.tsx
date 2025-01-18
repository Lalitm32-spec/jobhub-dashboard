import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Header } from "@/components/Header";
import { FileUpload } from "@/components/FileUpload";
import { JobDetailsForm } from "@/components/JobDetailsForm";
import { OutputSection } from "@/components/OutputSection";
import { TaskStatusSidebar } from "@/components/TaskStatusSidebar";

export const ResumeGenerator = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Resume Generator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Upload Documents</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <FileUpload
                  label="Upload Resume"
                  acceptedFiles={[".docx", ".pdf"]}
                  description="Drag and drop your resume here"
                />
                <FileUpload
                  label="Upload Job Description"
                  acceptedFiles={[".txt", ".docx", ".pdf"]}
                  description="Drag and drop the job description here"
                />
              </div>
            </div>
            
            <JobDetailsForm />
            <OutputSection />
          </div>
          
          <div className="lg:col-span-1">
            <TaskStatusSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};