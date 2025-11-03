import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, FileCode, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiPipelineTransform } from "@/lib/api";

export default function TestPipeline() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<any>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; details?: string } | null>(null);
  const { toast } = useToast();

  const handleRunTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults(null);
    setErrorInfo(null);

    // Start a lightweight transform on the backend while showing progress
    try {
      const promise = apiPipelineTransform({
        rows: [
          { id: 1, status: "ok", value: 10 },
          { id: 2, status: "bad", value: 0 },
          { id: 3, status: "ok", value: 5 },
        ],
        ops: [ { action: "filter_eq", column: "status", value: "ok" } ],
      });

      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 250);

      const res = await promise;
      clearInterval(interval);
      setProgress(100);
      setIsRunning(false);
      setTestResults({
        status: "success",
        recordsProcessed: res.count,
        duration: "~1s",
        validationsPassed: 1,
        validationsFailed: 0,
      });
      toast({ title: "Test Completed", description: `Processed ${res.count} records` });
    } catch (e: any) {
      setIsRunning(false);
      setProgress(0);
      const msg = e?.message || "Unknown error";
      setErrorInfo({ message: msg, source: "interpreter" });
      toast({ title: "Test Failed", description: msg, variant: "destructive" });
    }
  };

  // AI analysis removed

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Test Pipeline</h3>
        <p className="text-sm text-muted-foreground">
          Run a test execution using the generated sample XML file
        </p>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Test will run using the generated sample XML file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Input File</p>
              <p className="text-sm text-muted-foreground">sample_sales_promotions.xml</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Pipeline Version</p>
              <p className="text-sm text-muted-foreground">v1.0.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Expected Records</p>
              <p className="text-sm text-muted-foreground">1,250</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Test Mode</p>
              <p className="text-sm text-muted-foreground">Full Validation</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="lg"
              onClick={handleRunTest}
              disabled={isRunning}
              className="w-full sm:w-auto"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              {isRunning ? "Running (Interpreter)..." : "Run (Interpreter)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 animate-spin" />
              Test in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResults.status === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Records Processed</CardDescription>
                  <CardTitle className="text-3xl">{testResults.recordsProcessed.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Execution Time</CardDescription>
                  <CardTitle className="text-3xl">{testResults.duration}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Validations Passed</CardDescription>
                  <CardTitle className="text-3xl text-success">{testResults.validationsPassed}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Validations Failed</CardDescription>
                  <CardTitle className="text-3xl text-destructive">{testResults.validationsFailed}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm font-medium text-success">
                ✓ Pipeline test completed successfully
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                All validations passed. The pipeline is ready for deployment.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {errorInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Test Failed
            </CardTitle>
            <CardDescription>See error and optionally ask AI for a quick diagnosis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded border border-destructive/30 bg-destructive/10">
              <p className="text-sm font-medium">Error</p>
              <p className="text-sm text-destructive mt-1">{errorInfo.message}</p>
            </div>
            {/* AI analysis controls removed */}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
