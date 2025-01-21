import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Documentation() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome to the Job Tracker documentation. Here you'll find everything you need to know about using the application effectively.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}