
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart2, ClipboardList, Search } from 'lucide-react';

interface JobBoardHeaderProps {
  title: string;
}

const JobBoardHeader: React.FC<JobBoardHeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="outline" onClick={() => navigate('/job-board/analytics')}>
          <BarChart2 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
        
        <Button variant="outline" onClick={() => navigate('/job-board/follow-ups')}>
          <ClipboardList className="h-4 w-4 mr-2" />
          Follow-ups
        </Button>
        
        <Button variant="outline" onClick={() => navigate('/library')}>
          <Search className="h-4 w-4 mr-2" />
          Query Library
        </Button>
        
        <Button onClick={() => navigate('/job-board/new-application')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>
    </div>
  );
};

export default JobBoardHeader;
