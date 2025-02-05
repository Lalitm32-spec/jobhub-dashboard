import { useState } from "react";
import { HelpCircle, Search, Keyboard, ExternalLink } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HelpButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-primary text-white hover:bg-primary/90"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <div className="space-y-2">
            <Link
              to="/get-started"
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">Get Started</span>
            </Link>
            <Link
              to="/help/documentation"
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm">Help Center</span>
            </Link>
            <Link
              to="/keyboard-shortcuts"
              className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Keyboard className="h-4 w-4" />
              <span className="text-sm">Keyboard Shortcuts</span>
            </Link>
            <div className="border-t pt-2 mt-2">
              <a
                href="/terms"
                className="block text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 p-1"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="block text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 p-1"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};