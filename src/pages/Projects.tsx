import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, GitBranch, FileCode } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    id: 1,
    name: "Sales Promotion Analytics",
    description: "End-to-end sales promotion data pipeline",
    pipelines: 3,
    lastUpdated: "2 hours ago",
    status: "active"
  },
  {
    id: 2,
    name: "Customer Behavior Analysis",
    description: "Customer segmentation and behavior tracking",
    pipelines: 2,
    lastUpdated: "1 day ago",
    status: "active"
  },
  {
    id: 3,
    name: "Inventory Management",
    description: "Real-time inventory tracking and forecasting",
    pipelines: 1,
    lastUpdated: "3 days ago",
    status: "inactive"
  }
];

export default function Projects() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Projects</h2>
          <p className="text-muted-foreground">Manage your data engineering projects and pipelines</p>
        </div>
        <Button size="lg">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="shadow-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
                <Badge variant={project.status === "active" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  {project.pipelines} Pipeline{project.pipelines !== 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground">{project.lastUpdated}</span>
              </div>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to={`/project/${project.id}`}>
                    View Pipelines
                  </Link>
                </Button>
                <Button variant="outline" size="icon">
                  <FileCode className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Projects</p>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Active Pipelines</p>
            <p className="text-2xl font-bold">6</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total XSD Files</p>
            <p className="text-2xl font-bold">8</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Deployments Today</p>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
