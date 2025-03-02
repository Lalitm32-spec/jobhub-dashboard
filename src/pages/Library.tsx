
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Search, Archive, Plus, Trash2, Edit, 
  FileText, FolderOpen, Database 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface JobSearchQuery {
  id: string;
  title: string;
  query: string;
  created_at: string;
  updated_at: string;
}

const Library = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuery, setEditingQuery] = useState<JobSearchQuery | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch queries
  const { data: queries, isLoading } = useQuery({
    queryKey: ['jobSearchQueries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_search_queries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching queries:', error);
        toast.error('Failed to load queries');
        return [];
      }
      
      return data as JobSearchQuery[];
    }
  });

  // Add or update query
  const mutation = useMutation({
    mutationFn: async (queryData: { title: string; query: string; id?: string }) => {
      if (queryData.id) {
        // Update existing query
        const { error } = await supabase
          .from('job_search_queries')
          .update({ 
            title: queryData.title, 
            query: queryData.query 
          })
          .eq('id', queryData.id);
        
        if (error) throw error;
        return { ...queryData, id: queryData.id };
      } else {
        // Insert new query
        const { data, error } = await supabase
          .from('job_search_queries')
          .insert({ 
            title: queryData.title, 
            query: queryData.query 
          })
          .select('*')
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobSearchQueries'] });
      toast.success(editingQuery ? 'Query updated successfully' : 'Query saved successfully');
      closeDialog();
    },
    onError: (error) => {
      console.error('Error saving query:', error);
      toast.error('Failed to save query');
    }
  });

  // Delete query
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_search_queries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
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
    if (!title.trim() || !query.trim()) {
      toast.error('Title and query are required');
      return;
    }

    const queryData = { 
      title, 
      query,
      ...(editingQuery ? { id: editingQuery.id } : {})
    };
    
    mutation.mutate(queryData);
  };

  const handleEdit = (query: JobSearchQuery) => {
    setEditingQuery(query);
    setTitle(query.title);
    setQuery(query.query);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this query?')) {
      deleteMutation.mutate(id);
    }
  };

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setEditingQuery(null);
    setTitle('');
    setQuery('');
  };

  const filteredQueries = queries?.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.query.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Job Search Query Library</h1>
        <Button onClick={openDialog} className="flex items-center gap-2">
          <Plus size={20} />
          <span>Add Query</span>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search queries..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading queries...</p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Archive className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-xl font-medium mb-2">No queries found</p>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try a different search term' : 'Add your first job search query to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={openDialog} className="flex items-center gap-2 mx-auto">
                <Plus size={16} />
                <span>Add New Query</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database size={20} />
                <span>Saved Queries ({filteredQueries.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText size={16} />
                          {item.title}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{item.query}</TableCell>
                      <TableCell>{new Date(item.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingQuery ? 'Edit Query' : 'Add New Query'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="E.g., Senior React Developer Jobs"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="query">Query</Label>
              <Textarea
                id="query"
                placeholder="Enter your job search query..."
                rows={5}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSave}>Save Query</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Library;
