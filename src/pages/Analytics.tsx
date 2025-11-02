import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">No analytics available yet.</p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>Run pipelines and validations to populate analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data to display.</p>
        </CardContent>
      </Card>
    </div>
  );
}
