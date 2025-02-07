import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Profile = () => {
  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your profile information will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
};