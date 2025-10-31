import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, FileCode, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function TestPipeline() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const handleRunTest = () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults(null);

    // Simulate test execution
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setTestResults({
            status: "success",
            recordsProcessed: 1250,
            duration: "2.3s",
            validationsPassed: 12,
            validationsFailed: 0,
          });
          toast({
            title: "Test Completed",
            description: "Pipeline test executed successfully",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

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

          <Button
            size="lg"
            onClick={handleRunTest}
            disabled={isRunning}
            className="w-full"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {isRunning ? "Running Test..." : "Run Test Pipeline"}
          </Button>
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
    </div>
  );
}
