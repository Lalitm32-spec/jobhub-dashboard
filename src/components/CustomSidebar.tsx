import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Mail,
  Briefcase,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  BarChart,
  Bell,
  Ghost,
  Search,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const SidebarLink = ({ to, icon, label, isActive }: SidebarLinkProps) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export function CustomSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">JobHub</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3">
        <Link
          to="/job-board/new"
          className="flex items-center gap-2 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Application</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <SidebarLink
          to="/dashboard"
          icon={<Home className="h-4 w-4" />}
          label="Dashboard"
          isActive={isActive("/dashboard")}
        />
        <SidebarLink
          to="/job-board"
          icon={<Briefcase className="h-4 w-4" />}
          label="Job Board"
          isActive={isActive("/job-board")}
        />
        <SidebarLink
          to="/job-board/analytics"
          icon={<BarChart className="h-4 w-4" />}
          label="Analytics"
          isActive={isActive("/job-board/analytics")}
        />
        <SidebarLink
          to="/email"
          icon={<Mail className="h-4 w-4" />}
          label="Email Tools"
          isActive={isActive("/email")}
        />
        <SidebarLink
          to="/resume-generator"
          icon={<FileText className="h-4 w-4" />}
          label="Resume Generator"
          isActive={isActive("/resume-generator")}
        />
        <SidebarLink
          to="/job-board/follow-ups"
          icon={<Bell className="h-4 w-4" />}
          label="Follow-ups"
          isActive={isActive("/job-board/follow-ups")}
        />
        <SidebarLink
          to="/job-board/ghosted"
          icon={<Ghost className="h-4 w-4" />}
          label="Ghosted"
          isActive={isActive("/job-board/ghosted")}
        />
      </nav>

      {/* Help Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-1">
          <SidebarLink
            to="/help/documentation"
            icon={<HelpCircle className="h-4 w-4" />}
            label="Help Center"
            isActive={isActive("/help/documentation")}
          />
          <SidebarLink
            to="/settings"
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            isActive={isActive("/settings")}
          />
        </div>
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">User Account</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}