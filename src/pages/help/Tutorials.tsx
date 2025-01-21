import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function Tutorials() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Video Tutorials</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started Tutorial</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Watch Tutorial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}