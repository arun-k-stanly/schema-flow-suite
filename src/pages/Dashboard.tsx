import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const workflowSteps = [
  { id: 1, name: "Upload XSD", status: "completed", path: "/upload" },
  { id: 2, name: "Generate XML", status: "completed", path: "/generate-xml" },
  { id: 3, name: "Data Model", status: "in-progress", path: "/data-model" },
  { id: 4, name: "PySpark Pipeline", status: "pending", path: "/pyspark" },
  { id: 5, name: "Execution", status: "pending", path: "/execution" },
  { id: 6, name: "Validation", status: "pending", path: "/validation" },
  { id: 7, name: "Data Quality", status: "pending", path: "/quality" },
  { id: 8, name: "Analytics", status: "pending", path: "/analytics" },
];

const recentActivities = [
  { action: "XSD file uploaded", time: "2 minutes ago", status: "success" },
  { action: "Sample XML generated", time: "5 minutes ago", status: "success" },
  { action: "Data model creation started", time: "8 minutes ago", status: "in-progress" },
];

export default function Dashboard() {
  const completedSteps = workflowSteps.filter(s => s.status === "completed").length;
  const progress = (completedSteps / workflowSteps.length) * 100;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 text-primary-foreground shadow-glow">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Data Pipeline</h2>
          <p className="text-primary-foreground/90 mb-6">
            End-to-end workflow from XSD to actionable analytics
          </p>
          <div className="flex gap-4">
            <Link to="/upload">
              <Button size="lg" variant="secondary">
                Start New Pipeline
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      </div>

      {/* Workflow Progress */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
          <CardDescription>Track your pipeline status across all stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{completedSteps} of {workflowSteps.length} completed</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((step) => (
                <Link key={step.id} to={step.path}>
                  <Card className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          step.status === "completed" ? "bg-success/20 text-success" :
                          step.status === "in-progress" ? "bg-warning/20 text-warning" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {step.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                           step.status === "in-progress" ? <Clock className="w-5 h-5" /> :
                           <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{step.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{step.status.replace("-", " ")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Runs</p>
                <p className="text-3xl font-bold text-foreground">24</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Quality Score</p>
                <p className="text-3xl font-bold text-success">98.5%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Records Processed</p>
                <p className="text-3xl font-bold text-foreground">1.2M</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === "success" ? "bg-success" :
                  activity.status === "in-progress" ? "bg-warning" :
                  "bg-muted-foreground"
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
