import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsCard } from "@/components/MetricsCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { ChartPie, TrendingUp, Building2, Calendar, Mail } from "lucide-react";
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your job application progress</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Applications"
          value="95"
          icon={ChartPie}
          trend={{ value: "+12% from last month", isPositive: true }}
        />
        <MetricsCard
          title="Active Applications"
          value="45"
          icon={TrendingUp}
          trend={{ value: "+5% from last month", isPositive: true }}
        />
        <MetricsCard
          title="Interviews Scheduled"
          value="12"
          icon={Calendar}
          trend={{ value: "+2 this week", isPositive: true }}
        />
        <MetricsCard
          title="Response Rate"
          value="48%"
          icon={Mail}
          trend={{ value: "+8% from last month", isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
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