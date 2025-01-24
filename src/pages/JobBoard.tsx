import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Building2, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Job {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'interview' | 'rejected' | 'ghosted' | 'offered';
  date?: string;
}

const BOARD_COLUMNS = [
  { id: 'applied', title: 'Applied', color: 'from-blue-500 to-blue-600', icon: Calendar },
  { id: 'interview', title: 'Interview', color: 'from-purple-500 to-purple-600', icon: Building2 },
  { id: 'offered', title: 'Offered', color: 'from-green-500 to-green-600', icon: Briefcase },
  { id: 'rejected', title: 'Rejected', color: 'from-red-500 to-red-600', icon: Calendar },
  { id: 'ghosted', title: 'Ghosted', color: 'from-gray-500 to-gray-600', icon: Building2 },
];

export default function JobBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch jobs from Supabase
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }

      return data as Job[];
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          // Refetch jobs when changes occur
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleAddJob = async (status: Job['status']) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .insert({
          company: 'New Company',
          position: 'New Position',
          status,
          date: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Job added",
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

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job status updated",
        description: `Job moved to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Applications Board</h1>
        <p className="text-gray-600">Track and manage your job applications</p>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 overflow-x-auto">
          {BOARD_COLUMNS.map((column) => (
            <div key={column.id} className="min-w-[300px]">
              <div className={`rounded-t-xl bg-gradient-to-r ${column.color} p-4 shadow-lg`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <column.icon className="h-5 w-5 text-white" />
                    <h2 className="text-white font-semibold">{column.title}</h2>
                  </div>
                  <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm">
                    {getJobsByStatus(column.id as Job['status']).length}
                  </span>
                </div>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-white rounded-b-xl p-4 min-h-[500px] shadow-lg"
                  >
                    {getJobsByStatus(column.id as Job['status']).map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card className="mb-3 hover:shadow-lg transition-all duration-200 border-l-4 hover:scale-102">
                              <CardHeader className="p-4">
                                <CardTitle className="text-base font-semibold text-gray-900">
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
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    <Button
                      variant="ghost"
                      className="w-full mt-2 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
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