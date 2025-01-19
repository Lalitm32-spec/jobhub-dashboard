import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";

interface Task {
  id: string;
  jobTitle: string;
  company: string;
  resumeStatus: "Generated" | "Pending";
  coverLetterStatus: "Generated" | "Pending";
  emailStatus: "Completed" | "In Progress";
  resume?: string;
  coverLetter?: string;
  email?: string;
}

const tasks: Task[] = [
  {
    id: "1",
    jobTitle: "Software Engineer",
    company: "Google",
    resumeStatus: "Generated",
    coverLetterStatus: "Generated",
    emailStatus: "Completed",
    resume: "Customized resume content for Google Software Engineer position...",
    coverLetter: "Dear Hiring Manager,\n\nI am writing to express my interest...",
    email: "Subject: Software Engineer Position Application\n\nDear Recruitment Team..."
  },
  {
    id: "2",
    jobTitle: "Frontend Developer",
    company: "Meta",
    resumeStatus: "Generated",
    coverLetterStatus: "Pending",
    emailStatus: "In Progress",
    resume: "Customized resume content for Meta Frontend Developer position...",
  },
];

export const TasksTable = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Cover Letter</TableHead>
            <TableHead>Email Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">
                {task.jobTitle}
                <span className="ml-1 text-sm text-gray-500">at {task.company}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={task.resumeStatus === "Generated" ? "default" : "secondary"}
                >
                  {task.resumeStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={task.coverLetterStatus === "Generated" ? "default" : "secondary"}
                >
                  {task.coverLetterStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={task.emailStatus === "Completed" ? "success" : "secondary"}
                >
                  {task.emailStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedTask(task)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Application Documents for {task.jobTitle}</DialogTitle>
                      <DialogDescription>
                        View and manage your customized documents for {task.company}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="resume" className="mt-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="resume">Resume</TabsTrigger>
                        <TabsTrigger value="coverLetter">Cover Letter</TabsTrigger>
                        <TabsTrigger value="email">Cold Email</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="resume" className="mt-4">
                        <div className="rounded-lg border p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Customized Resume</h3>
                            <div className="space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => task.resume && handleCopy(task.resume, "Resume")}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </Button>
                              <Button size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap text-sm text-gray-600">
                            {task.resume || "Resume not generated yet"}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="coverLetter" className="mt-4">
                        <div className="rounded-lg border p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Cover Letter</h3>
                            <div className="space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => task.coverLetter && handleCopy(task.coverLetter, "Cover Letter")}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </Button>
                              <Button size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </Button>
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap text-sm text-gray-600">
                            {task.coverLetter || "Cover letter not generated yet"}
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="email" className="mt-4">
                        <div className="rounded-lg border p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Cold Email</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => task.email && handleCopy(task.email, "Email")}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Email
                            </Button>
                          </div>
                          <div className="whitespace-pre-wrap text-sm text-gray-600">
                            {task.email || "Email not generated yet"}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};