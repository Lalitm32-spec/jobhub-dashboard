import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Job {
  id: string;
  company: string;
  position: string;
  status: string;
  date?: string;
  location?: string;
}

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  provided: any;
}

export const JobCard = ({ job, onEdit, provided }: JobCardProps) => {
  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="p-4 hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{job.position}</h3>
          <p className="text-sm text-gray-500">{job.company}</p>
          {job.location && (
            <p className="text-sm text-gray-500 mt-1">{job.location}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(job)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {job.date && (
        <div className="mt-2 text-xs text-gray-500">
          Applied: {new Date(job.date).toLocaleDateString()}
        </div>
      )}
    </Card>
  );
};