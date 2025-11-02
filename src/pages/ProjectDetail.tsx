import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Settings, Trash2, PlayCircle, CheckCircle2, BarChart3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiListDeployments } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Deployment = { id: string; name: string; status: string };

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [pipelines, setPipelines] = useState<Deployment[]>([]);

  useEffect(() => {
    if (!projectId) return;
    apiListDeployments(String(projectId)).then(setPipelines).catch(() => setPipelines([]));
  }, [projectId]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/projects">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">Project {projectId}</h2>
          <p className="text-muted-foreground">Pipelines deployed for this project</p>
        </div>
        <Button size="lg" asChild>
          <Link to={`/project/${projectId}/pipeline/new`}>
            <Plus className="w-4 h-4 mr-2" />
            New Pipeline
          </Link>
        </Button>
      </div>

      {/* Pipelines List */}
      <div className="space-y-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{pipeline.name}</h3>
                    <Badge variant={pipeline.status === "deployed" ? "default" : "secondary"}>{pipeline.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Recorded deployment</p>
                </div>
                <div className="flex gap-2">
                  <Button size="lg" asChild>
                    <Link to={`/project/${projectId}/pipeline/${pipeline.id}/execution`}>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Execute Pipeline
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to={`/project/${projectId}/pipeline/${pipeline.id}`}>
                      Open Pipeline
                    </Link>
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/project/${projectId}/pipeline/${pipeline.id}/validation`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Validation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/project/${projectId}/pipeline/${pipeline.id}/analytics`}>
                            <BarChart3 className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Analytics</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Pipelines</p>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Running Now</p>
            <p className="text-2xl font-bold text-primary">1</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Records</p>
            <p className="text-2xl font-bold">4.35M</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Avg Success Rate</p>
            <p className="text-2xl font-bold text-success">99.4%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
