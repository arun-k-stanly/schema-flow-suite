import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Download, Play } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiGenerateModel, apiGenerateCode, apiCreateDeployment } from "@/lib/api";

export default function BuildPipeline() {
  const { toast } = useToast();
  const [code, setCode] = useState<string>("");
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Build Data Pipeline</h2>
        <p className="text-muted-foreground">Generate PySpark code based on your data model</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pipeline Actions */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Pipeline Actions</CardTitle>
            <CardDescription>Control your ETL workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" size="lg" onClick={async () => {
              try {
                const { model } = await apiGenerateModel();
                const res = await apiGenerateCode(model);
                setCode(res.code);
                toast({ title: "Code generated", description: "PySpark ETL created" });
              } catch (e: any) {
                toast({ title: "Generation failed", description: e.message, variant: "destructive" });
              }
            }}>
              <Code className="w-4 h-4 mr-2" />
              Generate PySpark Code
            </Button>
            <Button variant="outline" className="w-full" onClick={() => {
              if (!code) return;
              const blob = new Blob([code], { type: 'text/x-python' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'pipeline.py';
              a.click();
            }} disabled={!code}>
              <Download className="w-4 h-4 mr-2" />
              Download Code
            </Button>
            <Button variant="outline" className="w-full" onClick={async () => {
              if (!code) { toast({ title: "No code", description: "Generate code first" }); return; }
              try {
                await apiCreateDeployment('default', 'Generated Pipeline', code);
                toast({ title: "Deployed", description: "Pipeline recorded as deployed" });
              } catch (e: any) {
                toast({ title: "Deploy failed", description: e.message, variant: "destructive" });
              }
            }}>
              <Play className="w-4 h-4 mr-2" />
              Deploy (record)
            </Button>
          </CardContent>
        </Card>

        {/* Code View */}
        <Card className="lg:col-span-3 shadow-card border-border">
          <CardHeader>
            <CardTitle>Pipeline Code</CardTitle>
            <CardDescription>Code preview will appear after model is defined</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pyspark">
              <TabsList className="mb-4">
                <TabsTrigger value="pyspark">PySpark Code</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pyspark">
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  {code ? (
                    <pre className="text-xs font-mono"><code>{code}</code></pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">No code generated yet.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="config">
                <div className="bg-muted rounded-lg p-4 overflow-x-auto">
                  <p className="text-sm text-muted-foreground">No configuration available.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder guidance */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>Define a data model to enable code generation</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
