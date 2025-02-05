import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Focus, ArrowRight, Paperclip, Search } from "lucide-react";

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

          {/* Weather-like Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Applications</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">24</span>
                <span className="text-green-500">↑ 12%</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Interviews</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">8</span>
                <span className="text-green-500">↑ 8%</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Response Rate</h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">33%</span>
                <span className="text-green-500">↑ 5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}