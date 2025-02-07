import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { JOB_STATUS } from '@/components/JobDetailsForm';
import { JobBoardHeader } from '@/components/job-board/JobBoardHeader';
import { JobBoardFilters } from '@/components/job-board/JobBoardFilters';
import { JobCard } from '@/components/job-board/JobCard';

interface Job {
  id: string;
  company: string;
  position: string;
  status: string;
  date?: string;
}

const STATUSES = [
  { id: JOB_STATUS.APPLIED, label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { id: JOB_STATUS.INTERVIEW, label: 'Interview', color: 'bg-orange-100 text-orange-700' },
  { id: JOB_STATUS.OFFER, label: 'Offer', color: 'bg-green-100 text-green-700' },
  { id: JOB_STATUS.REJECTED, label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

export default function JobBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery({
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
      return data as Job[];
    },
  });

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: destination.droppableId,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggableId);

      if (error) throw error;

      toast.success("Job status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error("Failed to update job status");
    }
  };

  const handleUpdateJob = async (updatedJob: Partial<Job>) => {
    if (!editingJob) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          company: updatedJob.company,
          position: updatedJob.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingJob.id);

      if (error) throw error;

      toast.success("Job updated successfully");
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error("Failed to update job");
    }
  };

  const handleAddJob = async (status: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast.error("You must be logged in to add jobs.");
        return;
      }

      const { error } = await supabase
        .from('jobs')
        .insert({
          company: 'New Company',
          position: 'New Position',
          status: status,
          user_id: session.session.user.id,
        });

      if (error) throw error;

      toast.success("New job added successfully");
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error("Failed to add new job");
    }
  };

  const getJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status.toLowerCase() === status.toLowerCase());
  };

  const filteredJobs = (status: string) => {
    return getJobsByStatus(status).filter(job => 
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <JobBoardHeader 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <JobBoardFilters />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-6">
          {STATUSES.map((status) => (
            <div key={status.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`px-4 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label} ({filteredJobs(status.id).length})
                </div>
              </div>

              <Droppable droppableId={status.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {filteredJobs(status.id).map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided) => (
                          <JobCard
                            job={job}
                            onEdit={(job) => {
                              setEditingJob(job);
                              setIsEditDialogOpen(true);
                            }}
                            provided={provided}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input
                value={editingJob?.company || ''}
                onChange={(e) => setEditingJob(prev => prev ? { ...prev, company: e.target.value } : null)}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Input
                value={editingJob?.position || ''}
                onChange={(e) => setEditingJob(prev => prev ? { ...prev, position: e.target.value } : null)}
                placeholder="Enter position"
              />
            </div>
            <Button 
              className="w-full"
              onClick={() => editingJob && handleUpdateJob(editingJob)}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
