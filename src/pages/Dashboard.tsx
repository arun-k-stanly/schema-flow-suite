import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-primary-foreground shadow-glow">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Data Pipeline</h2>
          <p className="text-primary-foreground/90 mb-6">
            Build your workflow from metadata to analytics
          </p>
          <div className="flex gap-4">
            <Link to="/projects">
              <Button size="lg" variant="secondary">
                Create a Project
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      </div>
      {/* Empty dashboard sections until data is available */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Create a project to begin building pipelines</CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/projects">
            <Button>Go to Projects</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
