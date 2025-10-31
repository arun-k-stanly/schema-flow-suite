import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, CheckCircle2, AlertCircle, Server, Globe, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function DeployPipeline() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDeployed, setIsDeployed] = useState(false);
  const { toast } = useToast();

  const handleDeploy = () => {
    setIsDeploying(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDeploying(false);
          setIsDeployed(true);
          toast({
            title: "Deployment Successful",
            description: "Pipeline is now live and ready for production use",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Deploy Pipeline</h3>
        <p className="text-sm text-muted-foreground">
          Deploy your pipeline to production environment
        </p>
      </div>

      {/* Pre-deployment Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Deployment Checklist</CardTitle>
          <CardDescription>
            Ensure all requirements are met before deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm">XSD file validated</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm">Sample XML generated</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm">Data model created</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm">PySpark code generated</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm">Pipeline tested successfully</span>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Environment</p>
              <Badge variant="default">Production</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Cluster</p>
              <p className="text-sm text-muted-foreground">spark-cluster-prod-01</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Resources</p>
              <p className="text-sm text-muted-foreground">4 cores, 16GB RAM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deploy Button */}
      {!isDeployed && !isDeploying && (
        <Button
          size="lg"
          onClick={handleDeploy}
          className="w-full"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Deploy to Production
        </Button>
      )}

      {/* Deployment Progress */}
      {isDeploying && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 animate-pulse" />
              Deploying Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Uploading pipeline artifacts...</p>
              <p>• Configuring Spark cluster...</p>
              <p>• Validating dependencies...</p>
              <p>• Starting pipeline services...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Success */}
      {isDeployed && (
        <Card className="border-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="w-5 h-5" />
              Pipeline Deployed Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10">
              <p className="text-sm font-medium mb-2">Your pipeline is now live!</p>
              <p className="text-sm text-muted-foreground">
                The pipeline has been successfully deployed to production and is ready to process data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <CardDescription>Endpoint</CardDescription>
                  </div>
                  <p className="text-xs font-mono">api.prod.pipeline.io</p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-primary" />
                    <CardDescription>Status</CardDescription>
                  </div>
                  <p className="text-xs font-medium text-success">Active</p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <CardDescription>Security</CardDescription>
                  </div>
                  <p className="text-xs font-medium">Enabled</p>
                </CardHeader>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                View Logs
              </Button>
              <Button variant="outline" className="flex-1">
                Monitor Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
