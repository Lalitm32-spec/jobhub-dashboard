import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interview' | 'rejected' | 'ghosted' | 'offered';
}

const INITIAL_JOBS: Job[] = [
  { id: '1', company: 'Paragon Insurance', position: 'Software Engineer', status: 'applied' },
  { id: '2', company: 'Anytime Invest', position: 'Frontend Developer', status: 'interview' },
];

const BOARD_COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-600' },
  { id: 'interview', title: 'Interview', color: 'bg-purple-600' },
  { id: 'offered', title: 'Offered', color: 'bg-green-600' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-600' },
  { id: 'ghosted', title: 'Ghosted', color: 'bg-gray-600' },
];

export default function JobBoard() {
  const [jobs, setJobs] = React.useState<Job[]>(INITIAL_JOBS);
  const { toast } = useToast();

  const handleAddJob = (status: Job['status']) => {
    const newJob = {
      id: Math.random().toString(),
      company: 'New Company',
      position: 'New Position',
      status,
    };
    setJobs([...jobs, newJob]);
    toast({
      title: "Job added",
      description: "New job card has been added to the board.",
    });
  };

  const getJobsByStatus = (status: Job['status']) => {
    return jobs.filter(job => job.status === status);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Job Applications Board</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
        {BOARD_COLUMNS.map((column) => (
          <div key={column.id} className="min-w-[300px]">
            <div className={`rounded-t-lg ${column.color} p-3`}>
              <div className="flex justify-between items-center">
                <h2 className="text-white font-semibold">{column.title}</h2>
                <span className="bg-white bg-opacity-20 text-white px-2 py-1 rounded">
                  {getJobsByStatus(column.id as Job['status']).length}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-b-lg p-3 min-h-[500px]">
              {getJobsByStatus(column.id as Job['status']).map((job) => (
                <Card key={job.id} className="mb-3 hover:shadow-md transition-shadow">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{job.company}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm text-gray-600">
                    {job.position}
                  </CardContent>
                </Card>
              ))}
              
              <Button
                variant="ghost"
                className="w-full mt-2 border-2 border-dashed border-gray-300 hover:border-gray-400"
                onClick={() => handleAddJob(column.id as Job['status'])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}