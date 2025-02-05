import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Focus, ArrowRight, Paperclip, Search, Briefcase, Calendar, Mail } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-gray-900 p-6">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-[#1A2B3B] dark:text-white mb-12">
            What do you want to know?
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Ask anything about your job search..."
              className="w-full px-4 py-3 text-lg bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-24"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowRight className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
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
        </div>

        {/* Job Search Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Applications</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Manage and monitor your job applications in one place</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Schedule Interviews</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Keep track of upcoming interviews and deadlines</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Templates</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Create and manage professional email templates</p>
          </div>
        </div>
      </div>
    </div>
  );
}