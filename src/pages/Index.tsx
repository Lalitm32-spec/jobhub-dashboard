import { FileText, Mail, User } from "lucide-react";
import { Header } from "@/components/Header";
import { MetricsCard } from "@/components/MetricsCard";
import { TasksTable } from "@/components/TasksTable";
import { UploadSection } from "@/components/UploadSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <MetricsCard
            title="Total Resumes Customized"
            value="32"
            icon={FileText}
            trend={{ value: "12% this month", isPositive: true }}
          />
          <MetricsCard
            title="Job Applications Generated"
            value="15"
            icon={User}
            trend={{ value: "5% this week", isPositive: true }}
          />
          <MetricsCard
            title="Cold Emails Sent"
            value="7"
            icon={Mail}
            trend={{ value: "3 pending", isPositive: false }}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Quick Upload</h2>
          <UploadSection />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Recent Tasks</h2>
          <TasksTable />
        </div>
      </main>
    </div>
  );
};

export default Index;