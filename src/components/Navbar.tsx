import { Link } from "react-router-dom";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export const Navbar = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">JobHub</span>
          </Link>
          <Link to="/resume-generator" className="text-sm font-medium transition-colors hover:text-primary">
            Resume Generator
          </Link>
          <Link to="/settings" className="text-sm font-medium transition-colors hover:text-primary">
            Settings
          </Link>
          <Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary">
            Profile
          </Link>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};