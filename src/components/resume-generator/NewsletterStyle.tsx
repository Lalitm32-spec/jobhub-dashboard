import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const NewsletterStyle = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    // Handle subscription logic here
    toast.success("Successfully subscribed!");
    setEmail("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="text-center space-y-4">
        <span className="inline-block px-4 py-1 text-emerald-600 text-sm font-medium bg-emerald-50 rounded-full">
          NEWSLETTER
        </span>
        
        <h2 className="text-3xl font-serif font-bold text-gray-900">
          Subscribe To Our Newsletter
        </h2>
        
        <p className="text-gray-600">
          Stay updated with our latest news and updates
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="max-w-md mx-auto">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg transition-all duration-200 group"
          >
            Subscribe
            <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </form>
      </div>
    </div>
  );
};