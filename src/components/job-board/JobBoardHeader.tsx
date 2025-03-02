
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function JobBoardHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      <Button onClick={() => navigate('/job-board/new-application')}>
        <Plus className="mr-2 h-4 w-4" />
        Add Application
      </Button>
    </div>
  );
}
