import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from "@/components/MetricsCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChartPie, TrendingUp, Users, Calendar, Mail, GraduationCap } from "lucide-react";
import { TasksTable } from "@/components/TasksTable";

const applicationData = [
  { name: 'Jan', applications: 4 },
  { name: 'Feb', applications: 7 },
  { name: 'Mar', applications: 5 },
  { name: 'Apr', applications: 8 },
  { name: 'May', applications: 12 },
  { name: 'Jun', applications: 9 },
];

const statusData = [
  { name: 'Applied', value: 40 },
  { name: 'Interview', value: 25 },
  { name: 'Offered', value: 5 },
  { name: 'Rejected', value: 15 },
  { name: 'Ghosted', value: 10 },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back, User! 👋</h1>
          <p className="text-muted-foreground">Here's what's happening with your job applications</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Applications"
          value="95"
          icon={ChartPie}
          trend={{ value: "+12% from last month", isPositive: true }}
          gradient={true}
        />
        <MetricsCard
          title="New Applications"
          value="2,543"
          icon={TrendingUp}
          trend={{ value: "+5% from last month", isPositive: true }}
        />
        <MetricsCard
          title="Total Students"
          value="12,543"
          icon={Users}
          trend={{ value: "+2 this week", isPositive: true }}
        />
        <MetricsCard
          title="Working Hours"
          value="25h 42m"
          icon={Calendar}
          trend={{ value: "+8% from last month", isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Application Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={applicationData}>
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
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="name" type="category" stroke="#888" />
                <Tooltip />
                <Bar dataKey="value" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <TasksTable />
        </CardContent>
      </Card>
    </div>
  );
}