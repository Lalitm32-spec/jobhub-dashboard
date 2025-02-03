import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronDown,
  RefreshCw,
  LayoutGrid
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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

const STATUSES = [
  { id: 'applied', label: 'APPLIED', color: 'bg-blue-100 text-blue-700' },
  { id: 'interview', label: 'INTERVIEW', color: 'bg-orange-100 text-orange-700' },
  { id: 'offer', label: 'OFFER', color: 'bg-green-100 text-green-700' },
  { id: 'rejected', label: 'NOT CHOSEN', color: 'bg-red-100 text-red-700' },
];

export default function JobBoard() {
  const [searchQuery, setSearchQuery] = useState('');
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
          status,
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">JobTrackerAI</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search jobs..."
              className="pl-10 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="icon" variant="outline">
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select>
          <Button variant="outline" className="w-[150px]">
            Job Title <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </Select>
        <Select>
          <Button variant="outline" className="w-[150px]">
            Company <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </Select>
        <Select>
          <Button variant="outline" className="w-[150px]">
            Location <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </Select>
      </div>

      {/* Job Board Columns */}
      <div className="grid grid-cols-4 gap-6">
        {STATUSES.map((status) => (
          <div key={status.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`px-4 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.label} ({filteredJobs(status.id).length})
              </div>
            </div>

            <div className="space-y-4">
              {filteredJobs(status.id).map((job) => (
                <Card key={job.id} className="p-4 hover:shadow-md transition-shadow">
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
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
              ))}

              <Button
                variant="ghost"
                className="w-full border-2 border-dashed border-gray-200 hover:border-gray-300"
                onClick={() => handleAddJob(status.id)}
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