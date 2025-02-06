import { Badge } from "./ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JOB_STATUS } from "./JobDetailsForm";

interface Task {
  id: string;
  position: string;
  company: string;
  status: string;
}

export const TaskStatusSidebar = () => {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['recent-jobs'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Task[];
    },
  });

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
          <TaskList tasks={tasks} isLoading={isLoading} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <TaskList tasks={tasks} isLoading={isLoading} />
      </div>
    </>
  );
};

const TaskList = ({ tasks, isLoading }: { tasks: Task[], isLoading: boolean }) => {
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case JOB_STATUS.APPLIED:
        return "default";
      case JOB_STATUS.INTERVIEW:
        return "success";
      case JOB_STATUS.OFFER:
        return "success"; // Changed from primary to success
      case JOB_STATUS.REJECTED:
        return "destructive";
      default:
        return "secondary";
    }
  };

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
                <h3 className="font-medium">{task.position}</h3>
                <p className="text-sm text-gray-500">{task.company}</p>
              </div>
              <Badge variant={getBadgeVariant(task.status)}>
                {task.status}
              </Badge>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-500">
            No jobs added yet
          </div>
        )}
      </div>
    </div>
  );
};