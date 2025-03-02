
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobBoardGmailIntegration } from './GmailIntegrationCard';

export function JobBoardFilters() {
  return (
    <div className="space-y-6 py-6">
      <JobBoardGmailIntegration />
      
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="px-3 py-1">
          All
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Applied
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Interview
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Offer
        </Badge>
        <Badge variant="outline" className="px-3 py-1">
          Rejected
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <span>Filter</span>
        </Button>
        <Button variant="outline" size="sm">
          <span>Sort</span>
        </Button>
      </div>
    </div>
  );
}
