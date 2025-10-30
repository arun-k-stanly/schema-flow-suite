import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Play, Settings, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const pipelines = [
  {
    id: 1,
    name: "Campaign Analysis Pipeline",
    xsdFile: "sales_promotion.xsd",
    status: "running",
    lastRun: "10 minutes ago",
    records: "1.2M",
    successRate: "99.8%"
  },
  {
    id: 2,
    name: "Product Performance Pipeline",
    xsdFile: "product_data.xsd",
    status: "completed",
    lastRun: "2 hours ago",
    records: "850K",
    successRate: "100%"
  },
  {
    id: 3,
    name: "Customer Segmentation Pipeline",
    xsdFile: "customer_info.xsd",
    status: "idle",
    lastRun: "1 day ago",
    records: "2.3M",
    successRate: "98.5%"
  }
];

export default function ProjectDetail() {
  const { projectId } = useParams();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/projects">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">Sales Promotion Analytics</h2>
          <p className="text-muted-foreground">End-to-end sales promotion data pipeline</p>
        </div>
        <Button size="lg">
          <Plus className="w-4 h-4 mr-2" />
          New Pipeline
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
                    <Badge 
                      variant={pipeline.status === "running" ? "default" : pipeline.status === "completed" ? "secondary" : "outline"}
                    >
                      {pipeline.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">XSD File: {pipeline.xsdFile}</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Last Run: </span>
                      <span className="font-medium">{pipeline.lastRun}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Records: </span>
                      <span className="font-medium">{pipeline.records}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate: </span>
                      <span className="font-medium text-success">{pipeline.successRate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="lg" asChild>
                    <Link to={`/data-model?pipeline=${pipeline.id}`}>
                      Select Pipeline
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Play className="w-4 h-4" />
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
