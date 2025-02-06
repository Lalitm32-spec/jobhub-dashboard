import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Briefcase,
  Mail,
  FileText,
  Settings,
  HelpCircle,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const NewSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isActive(to)
          ? "bg-primary/10 text-primary"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      } ${isCollapsed ? "justify-center" : ""}`}
    >
      <Icon className={`transition-all duration-200 ${isCollapsed ? "h-8 w-8" : "h-5 w-5"}`} />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ${
        isCollapsed ? "w-[80px]" : "w-[240px]"
      }`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Briefcase className={`text-primary transition-all duration-200 ${isCollapsed ? "h-8 w-8" : "h-6 w-6"}`} />
          {!isCollapsed && <span className="font-semibold text-lg">JobHub</span>}
        </div>
      </div>

      {/* Quick Action */}
      <div className="p-3">
        <Link
          to="/job-board/new"
          className={`flex items-center gap-2 w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Plus className={`transition-all duration-200 ${isCollapsed ? "h-6 w-6" : "h-4 w-4"}`} />
          {!isCollapsed && <span>New Job</span>}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavLink to="/dashboard" icon={Home} label="Home" />
        <NavLink to="/job-board" icon={Briefcase} label="Job Board" />
        <NavLink to="/email" icon={Mail} label="Email Tools" />
        <NavLink to="/resume-generator" icon={FileText} label="Resume" />
      </nav>

      {/* Help Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <NavLink to="/help/documentation" icon={HelpCircle} label="Help" />
        <NavLink to="/settings" icon={Settings} label="Settings" />
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className={`flex items-center gap-3 px-3 py-2 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">User Account</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pro Plan</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-4 border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
      >
        {isCollapsed ? (
          <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>
    </aside>
  );
};