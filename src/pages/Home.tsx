import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Home = () => {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-center gap-2">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          Welcome to JobHub
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Optimize your job search with AI-powered tools
        </p>
      </div>
      <div className="flex gap-4">
        <Link to="/resume-generator">
          <Button>Get Started</Button>
        </Link>
        <Link to="/auth">
          <Button variant="outline">Sign In</Button>
        </Link>
      </div>
    </div>
  );
};