import { Card } from "@/components/ui/card";
import { MetricsCard } from "@/components/MetricsCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartPie, TrendingUp, Users, Calendar } from "lucide-react";
import { TasksTable } from "@/components/TasksTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const fetchApplicationStats = async () => {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*');

  if (error) throw error;

  const monthlyData = jobs.reduce((acc: any, job: any) => {
    const month = new Date(job.created_at).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const statusData = jobs.reduce((acc: any, job: any) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalApplications: jobs.length,
    monthlyApplications: Object.entries(monthlyData).map(([name, applications]) => ({
      name,
      applications,
    })),
    statusDistribution: Object.entries(statusData).map(([name, value]) => ({
      name,
      value,
    })),
    recentApplications: jobs.slice(0, 5),
  };
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['applicationStats'],
    queryFn: fetchApplicationStats,
  });

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-xl mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search applications, companies, or positions..."
            className="pl-10 h-12 w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
          />
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Total Applications"
            value={stats?.totalApplications.toString() || "0"}
            icon={ChartPie}
            gradient={true}
          />
          <MetricsCard
            title="Active Applications"
            value={stats?.statusDistribution.find((s: any) => s.name === "Applied")?.value.toString() || "0"}
            icon={TrendingUp}
          />
          <MetricsCard
            title="Interviews"
            value={stats?.statusDistribution.find((s: any) => s.name === "Interview")?.value.toString() || "0"}
            icon={Users}
          />
          <MetricsCard
            title="This Month"
            value={stats?.monthlyApplications[stats.monthlyApplications.length - 1]?.applications.toString() || "0"}
            icon={Calendar}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Application Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.monthlyApplications || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="applications" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    dot={{ fill: '#4F46E5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4">Application Status</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.statusDistribution || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
          <TasksTable />
        </Card>
      </div>
    </div>
  );
}