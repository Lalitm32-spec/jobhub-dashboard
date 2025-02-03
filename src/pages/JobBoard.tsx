import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Job {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interview' | 'rejected' | 'ghosted' | 'offered';
  date?: string;
  user_id: string;
}

const BOARD_COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-500' },
  { id: 'interview', title: 'Interview', color: 'bg-purple-500' },
  { id: 'offered', title: 'Offered', color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
  { id: 'ghosted', title: 'Ghosted', color: 'bg-gray-500' },
];

export default function JobBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editedCompany, setEditedCompany] = useState("");
  const [editedPosition, setEditedPosition] = useState("");

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

  const handleEditOpen = (job: Job) => {
    setSelectedJob(job);
    setEditedCompany(job.company);
    setEditedPosition(job.position);
  };

  const handleEditSave = async () => {
    if (!selectedJob) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          company: editedCompany,
          position: editedPosition,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedJob.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job details updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedJob(null);
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: "Failed to update job details",
        variant: "destructive",
      });
    }
  };

  const handleAddJob = async (status: Job['status']) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to add jobs.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('jobs')
        .insert({
          company: 'New Company',
          position: 'New Position',
          status,
          date: new Date().toISOString(),
          user_id: session.session.user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New job card has been added to the board.",
      });
    } catch (error) {
      console.error('Error adding job:', error);
      toast({
        title: "Error",
        description: "Failed to add new job.",
        variant: "destructive",
      });
    }
  };

  const getJobsByStatus = (status: Job['status']) => {
    return jobs.filter(job => job.status === status);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const jobId = result.draggableId;
    const newStatus = destination.droppableId as Job['status'];

    // Optimistically update the UI
    queryClient.setQueryData(['jobs'], (oldData: Job[] | undefined) => {
      if (!oldData) return [];
      return oldData.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      );
    });

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Job moved to ${newStatus}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Applications Board</h1>
        <p className="text-gray-600">Track and manage your job applications</p>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {BOARD_COLUMNS.map((column) => (
            <div key={column.id} className="min-w-[300px] animate-fade-in">
              <div className={`rounded-t-xl ${column.color} p-4 transition-all duration-200`}>
                <div className="flex justify-between items-center">
                  <h2 className="text-white font-semibold">{column.title}</h2>
                  <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                    {getJobsByStatus(column.id as Job['status']).length}
                  </span>
                </div>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white rounded-b-xl p-4 min-h-[500px] transition-colors duration-200 ${
                      snapshot.isDraggingOver ? 'bg-gray-50' : ''
                    }`}
                  >
                    {getJobsByStatus(column.id as Job['status']).map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              transition: snapshot.isDragging
                                ? 'transform 50ms cubic-bezier(0.2, 0, 0, 1)'
                                : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
                            }}
                          >
                            <Dialog>
                              <DialogTrigger asChild>
                                <Card className={`mb-3 transition-all duration-200 ${
                                  snapshot.isDragging
                                    ? 'shadow-lg scale-105'
                                    : 'hover:shadow-md hover:-translate-y-1'
                                }`}>
                                  <CardHeader className="p-4">
                                    <CardTitle className="text-base font-semibold">
                                      {job.company}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <p className="text-sm text-gray-600 mb-2">{job.position}</p>
                                    {job.date && (
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(job.date).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Job Details</DialogTitle>
                                  <DialogDescription>
                                    Update the company and position information
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
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
                                <DialogFooter>
                                  <Button onClick={handleEditSave}>Save Changes</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    <Button
                      variant="ghost"
                      className="w-full mt-2 border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors duration-200"
                      onClick={() => handleAddJob(column.id as Job['status'])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Job
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}