import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface Task {
  id: string;
  jobTitle: string;
  company: string;
  resumeStatus: "Generated" | "Pending";
  coverLetterStatus: "Generated" | "Pending";
  emailStatus: "Completed" | "In Progress";
}

const tasks: Task[] = [
  {
    id: "1",
    jobTitle: "Software Engineer",
    company: "Google",
    resumeStatus: "Generated",
    coverLetterStatus: "Generated",
    emailStatus: "Completed",
  },
  {
    id: "2",
    jobTitle: "Frontend Developer",
    company: "Meta",
    resumeStatus: "Generated",
    coverLetterStatus: "Pending",
    emailStatus: "In Progress",
  },
];

export const TasksTable = () => {
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
                <Button variant="ghost" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};