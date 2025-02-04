import { Card } from "@/components/ui/card";
import { MetricsCard } from "@/components/MetricsCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Focus, Brain, ChartPie, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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
    latestApplication: jobs[0],
  };
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['applicationStats'],
    queryFn: fetchApplicationStats,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Main Content Box */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-center mb-8 text-[#1A2B3B] dark:text-white">
            What do you want to do?
          </h1>

          {/* Search Input */}
          <div className="relative mb-8">
            <Input
              type="text"
              placeholder="Ask anything..."
              className="w-full px-4 py-3 text-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-start mb-8">
            <Button 
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 text-[#1A2B3B] dark:text-gray-200 bg-[#EEF2F6] hover:bg-[#E2E8F0] dark:bg-gray-800 dark:hover:bg-gray-700 border-none"
            >
              <Brain className="h-5 w-5" />
              Reasoning · R1
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 text-[#1A2B3B] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Focus className="h-5 w-5" />
              Focus
            </Button>
          </div>

          {/* Metrics Carousel */}
          <div className="mb-8">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem>
                  <MetricsCard
                    title="Total Applications"
                    value={stats?.totalApplications.toString() || "0"}
                    icon={ChartPie}
                    gradient={true}
                  />
                </CarouselItem>
                <CarouselItem>
                  <MetricsCard
                    title="Active Applications"
                    value={stats?.statusDistribution.find((s: any) => s.name === "Applied")?.value.toString() || "0"}
                    icon={TrendingUp}
                  />
                </CarouselItem>
                <CarouselItem>
                  <MetricsCard
                    title="Interviews"
                    value={stats?.statusDistribution.find((s: any) => s.name === "Interview")?.value.toString() || "0"}
                    icon={Users}
                  />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

          {/* Latest Application */}
          {stats?.latestApplication && (
            <Card className="p-6 mb-8 bg-gray-50 dark:bg-gray-900 border-none">
              <h3 className="text-lg font-semibold mb-4 text-[#1A2B3B] dark:text-white">Latest Application</h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  Company: {stats.latestApplication.company}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Position: {stats.latestApplication.position}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Status: {stats.latestApplication.status}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Side Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-gray-50 dark:bg-gray-900 border-none">
            <h3 className="text-lg font-semibold mb-4 text-[#1A2B3B] dark:text-white">Application Trend</h3>
            <div className="h-[200px]">
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-gray-50 dark:bg-gray-900 border-none">
            <h3 className="text-lg font-semibold mb-4 text-[#1A2B3B] dark:text-white">Application Status</h3>
            <div className="h-[200px]">
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
      </div>
    </div>
  );
}