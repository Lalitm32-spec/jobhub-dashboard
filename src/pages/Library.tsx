
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interface for the component's state
interface JobSearchQuery {
  id?: string;
  title: string;
  query: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

const Library = () => {
  const queryClient = useQueryClient();
  const [currentQuery, setCurrentQuery] = useState<JobSearchQuery>({ title: '', query: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch job search queries from the database
  const { data: queries, isLoading } = useQuery({
    queryKey: ['jobSearchQueries'],
    queryFn: async () => {
      // Use type assertion to handle the table not being in TypeScript types yet
      const { data, error } = await supabase
        .from('job_search_queries' as any)
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Use type assertion to safely convert the data
      return (data as unknown) as JobSearchQuery[];
    },
  });

  // Create or update job search query
  const saveMutation = useMutation({
    mutationFn: async (queryData: JobSearchQuery) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) throw new Error('User not authenticated');
      
      if (queryData.id) {
        // Update existing query
        const { error } = await supabase
          .from('job_search_queries' as any)
          .update({ 
            title: queryData.title, 
            query: queryData.query 
          })
          .eq('id', queryData.id)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new query
        const { data, error } = await supabase
          .from('job_search_queries' as any)
          .insert({ 
            title: queryData.title, 
            query: queryData.query,
            user_id: userId
          });
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSearchQueries'] });
      setCurrentQuery({ title: '', query: '' });
      setIsEditing(false);
      toast.success('Query saved successfully');
    },
    onError: (error) => {
      console.error('Error saving query:', error);
      toast.error('Failed to save query');
    }
  });

  // Delete job search query
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_search_queries' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSearchQueries'] });
      toast.success('Query deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting query:', error);
      toast.error('Failed to delete query');
    }
  });

  const handleSave = () => {
    if (!currentQuery.title || !currentQuery.query) {
      toast.error('Title and query are required');
      return;
    }
    saveMutation.mutate(currentQuery);
  };

  const handleEdit = (query: JobSearchQuery) => {
    setCurrentQuery(query);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Job Search Query Library</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <p>Loading queries...</p>
            ) : queries && queries.length > 0 ? (
              queries.map((query) => (
                <Card key={query.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{query.title}</CardTitle>
                    <CardDescription>
                      Created: {new Date(query.created_at!).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{query.query}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 bg-muted/10 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(query)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => query.id && handleDelete(query.id)}>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p>No saved queries yet. Create your first job search query.</p>
            )}
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Query' : 'New Query'}</CardTitle>
              <CardDescription>
                {isEditing ? 'Update your job search query' : 'Create a new job search query template'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  placeholder="E.g., Senior Developer - React"
                  value={currentQuery.title}
                  onChange={(e) => setCurrentQuery(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="query" className="text-sm font-medium">Query Template</label>
                <Textarea
                  id="query"
                  placeholder="Your job search query template..."
                  rows={6}
                  value={currentQuery.query}
                  onChange={(e) => setCurrentQuery(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setCurrentQuery({ title: '', query: '' });
                setIsEditing(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : isEditing ? 'Update' : 'Save'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Library;
