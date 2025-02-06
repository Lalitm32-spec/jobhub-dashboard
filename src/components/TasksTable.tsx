import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JOB_STATUS } from "./JobDetailsForm";

interface Task {
  id: string;
  company: string;
  position: string;
  status: string;
  date?: string;
  location?: string;
}

export const TasksTable = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedCompany, setEditedCompany] = useState("");
  const [editedPosition, setEditedPosition] = useState("");
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
  });

  const handleEditOpen = (task: Task) => {
    setSelectedTask(task);
    setEditedCompany(task.company);
    setEditedPosition(task.position);
  };

  const handleEditSave = async () => {
    if (!selectedTask) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          company: editedCompany,
          position: editedPosition,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      toast.success("Job details updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error("Failed to update job details");
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case JOB_STATUS.APPLIED:
        return "default";
      case JOB_STATUS.INTERVIEW:
        return "success";
      case JOB_STATUS.OFFER:
        return "primary";
      case JOB_STATUS.REJECTED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks?.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">
                {task.position}
                <span className="ml-1 text-sm text-gray-500">at {task.company}</span>
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(task.status)}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditOpen(task)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Edit Job Application</DialogTitle>
                      <DialogDescription>
                        Update the details for this job application
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Company Name</label>
                          <Input
                            value={editedCompany}
                            onChange={(e) => setEditedCompany(e.target.value)}
                            placeholder="Enter company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Position</label>
                          <Input
                            value={editedPosition}
                            onChange={(e) => setEditedPosition(e.target.value)}
                            placeholder="Enter position"
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button onClick={handleEditSave}>Save Changes</Button>
                    </DialogFooter>
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