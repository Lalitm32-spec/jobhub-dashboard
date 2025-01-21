import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function NewApplication() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Added",
      description: "Your job application has been successfully added.",
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Application</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input placeholder="Enter company name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Position</label>
              <Input placeholder="Enter job position" />
            </div>
            <Button type="submit">Add Application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}