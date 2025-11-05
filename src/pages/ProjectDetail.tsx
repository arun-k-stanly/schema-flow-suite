import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Settings, Trash2, PlayCircle, CheckCircle2, BarChart3, Edit2, Check, X } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiListDeployments, apiUpdateDeployment, apiUpdateProject } from "@/lib/api";

type Deployment = { id: string; name: string; status: string };

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [pipelines, setPipelines] = useState<Deployment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pipelineName, setPipelineName] = useState("");
  const [editingPipeline, setEditingPipeline] = useState<string | null>(null);
  const [editingPipelineName, setEditingPipelineName] = useState("");
  const [editingProjectTitle, setEditingProjectTitle] = useState(false);
  const [projectTitle, setProjectTitle] = useState(`Project ${projectId}`);

  useEffect(() => {
    if (!projectId) return;
    apiListDeployments(String(projectId)).then(setPipelines).catch(() => setPipelines([]));
  }, [projectId]);

  const handleCreatePipeline = () => {
    if (pipelineName.trim()) {
      // Close dialog and navigate to pipeline creation with the name
      setIsDialogOpen(false);
      navigate(`/project/${projectId}/pipeline/new?name=${encodeURIComponent(pipelineName.trim())}`);
      setPipelineName(""); // Reset the name
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setPipelineName(""); // Reset name when dialog closes
    }
  };

  const handlePipelineEditStart = (pipelineId: string, currentName: string) => {
    setEditingPipeline(pipelineId);
    setEditingPipelineName(currentName);
  };

  const handlePipelineEditSave = async (pipelineId: string) => {
    try {
      await apiUpdateDeployment(pipelineId, { 
        project_id: String(projectId), 
        name: editingPipelineName 
      });
      // Update the pipeline name in the local state
      setPipelines(prevPipelines => 
        prevPipelines.map(pipeline => 
          pipeline.id === pipelineId 
            ? { ...pipeline, name: editingPipelineName }
            : pipeline
        )
      );
      setEditingPipeline(null);
      setEditingPipelineName("");
    } catch (error) {
      console.error("Failed to update pipeline name:", error);
    }
  };

  const handlePipelineEditCancel = () => {
    setEditingPipeline(null);
    setEditingPipelineName("");
  };

  const handleProjectTitleEditStart = () => {
    setEditingProjectTitle(true);
  };

  const handleProjectTitleEditSave = async () => {
    try {
      await apiUpdateProject(String(projectId), { name: projectTitle });
      setEditingProjectTitle(false);
    } catch (error) {
      console.error("Failed to update project title:", error);
    }
  };

  const handleProjectTitleEditCancel = () => {
    setProjectTitle(`Project ${projectId}`); // Reset to original
    setEditingProjectTitle(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/projects">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          {editingProjectTitle ? (
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="text-3xl font-bold"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleProjectTitleEditSave();
                  if (e.key === "Escape") handleProjectTitleEditCancel();
                }}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleProjectTitleEditSave}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleProjectTitleEditCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2 group">
              <h2 className="text-3xl font-bold">{projectTitle}</h2>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleProjectTitleEditStart}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">Pipelines deployed for this project</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Pipeline</DialogTitle>
              <DialogDescription>
                Enter a name for your new pipeline. You can change this later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pipeline-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="pipeline-name"
                  placeholder="e.g., Sales Analytics Pipeline"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  className="col-span-3"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && pipelineName.trim()) {
                      handleCreatePipeline();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePipeline}
                disabled={!pipelineName.trim()}
              >
                Create Pipeline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pipelines List */}
      <div className="space-y-4">
        {pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="group shadow-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {editingPipeline === pipeline.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingPipelineName}
                          onChange={(e) => setEditingPipelineName(e.target.value)}
                          className="text-xl font-semibold"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handlePipelineEditSave(pipeline.id);
                            if (e.key === "Escape") handlePipelineEditCancel();
                          }}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={() => handlePipelineEditSave(pipeline.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handlePipelineEditCancel}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{pipeline.name}</h3>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handlePipelineEditStart(pipeline.id, pipeline.name)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
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
                  <Button size="lg" variant="outline" asChild>
                    <Link to={`/project/${projectId}/pipeline/${pipeline.id}/validation`}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Validation
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to={`/project/${projectId}/pipeline/${pipeline.id}/analytics`}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Link>
                  </Button>
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
