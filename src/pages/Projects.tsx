import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FolderOpen, Plus, GitBranch, Trash2, Edit2, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiListProjects, apiUpdateProject } from "@/lib/api";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    apiListProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  const handleEditStart = (projectId: string, currentName: string) => {
    setEditingProject(projectId);
    setEditingName(currentName);
  };

  const handleEditSave = async (projectId: string) => {
    try {
      await apiUpdateProject(projectId, { name: editingName });
      // Update local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { ...project, name: editingName }
            : project
        )
      );
      setEditingProject(null);
      setEditingName("");
    } catch (error) {
      console.error("Failed to update project name:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingProject(null);
    setEditingName("");
  };

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
          <Card key={project.id} className="group shadow-card border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
                <Badge variant={project.status === "active" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {editingProject === project.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="text-xl font-semibold"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave(project.id);
                        if (e.key === "Escape") handleEditCancel();
                      }}
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={() => handleEditSave(project.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleEditStart(project.id, project.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
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
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
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
