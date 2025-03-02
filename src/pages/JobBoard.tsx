
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { JobBoardHeader } from '@/components/job-board/JobBoardHeader';
import { JobBoardFilters } from '@/components/job-board/JobBoardFilters';

const JobBoard = () => {
  const location = useLocation();
  const isRootJobBoard = location.pathname === '/job-board';
  
  return (
    <div className="container mx-auto py-8 px-4">
      {isRootJobBoard ? (
        <>
          <JobBoardHeader title="Job Board" />
          <JobBoardFilters />
        </>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default JobBoard;
