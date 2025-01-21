import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function Ghosted() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Ghosted Applications</h1>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ghost className="h-5 w-5" />
              No Response (30+ days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Example Corp</h3>
                  <p className="text-sm text-gray-500">Applied: 45 days ago</p>
                </div>
                <Button variant="outline" size="sm">Archive</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}