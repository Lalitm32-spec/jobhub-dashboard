import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";

interface Task {
  id: string;
  jobTitle: string;
  company: string;
  status: "Complete" | "In Progress";
}

const tasks: Task[] = [
  {
    id: "1",
    jobTitle: "Software Engineer",
    company: "Google",
    status: "Complete",
  },
  {
    id: "2",
    jobTitle: "Data Analyst",
    company: "Facebook",
    status: "In Progress",
  },
];

export const TaskStatusSidebar = () => {
  return (
    <>
      {/* Mobile trigger */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="icon">
            <MenuIcon className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <TaskList />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <TaskList />
      </div>
    </>
  );
};

const TaskList = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Recent Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{task.jobTitle}</h3>
                <p className="text-sm text-gray-500">{task.company}</p>
              </div>
              <Badge variant={task.status === "Complete" ? "default" : "secondary"}>
                {task.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};