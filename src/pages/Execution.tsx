import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const executionHistory = [
  { id: "run-001", status: "completed", startTime: "2024-01-15 10:30:00", duration: "11m 23s", records: "1,234,567" },
  { id: "run-002", status: "completed", startTime: "2024-01-14 10:30:00", duration: "10m 45s", records: "1,198,432" },
  { id: "run-003", status: "failed", startTime: "2024-01-13 10:30:00", duration: "2m 10s", records: "0" },
  { id: "run-004", status: "completed", startTime: "2024-01-12 10:30:00", duration: "11m 01s", records: "1,156,789" },
];

const logs = [
  { time: "10:30:01", level: "INFO", message: "Pipeline execution started" },
  { time: "10:30:15", level: "INFO", message: "Reading XML files from ADLS2" },
  { time: "10:32:45", level: "INFO", message: "Extracted 1.2M records successfully" },
  { time: "10:33:00", level: "INFO", message: "Starting transformations..." },
  { time: "10:37:30", level: "INFO", message: "Data quality checks passed (98.5%)" },
  { time: "10:38:00", level: "INFO", message: "Writing to Delta Lake..." },
  { time: "10:41:23", level: "INFO", message: "Pipeline completed successfully" },
];

export default function Execution() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Pipeline Execution & Monitoring</h2>
        <p className="text-muted-foreground">Schedule, run, and monitor your ETL pipeline</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Pipeline Controls</CardTitle>
            <CardDescription>Manage execution and scheduling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Run Now
            </Button>
            <Button variant="outline" className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Pipeline
            </Button>
            <Button variant="outline" className="w-full">
              <Pause className="w-4 h-4 mr-2" />
              Pause Scheduled Runs
            </Button>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Run</span>
                <span className="font-medium">Tomorrow 10:30 AM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium">Daily</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Timezone</span>
                <span className="font-medium">UTC</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader>
            <CardTitle>Current Execution</CardTitle>
            <CardDescription>Real-time pipeline status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <div className="flex-1">
                  <p className="font-medium">Last run completed successfully</p>
                  <p className="text-sm text-muted-foreground">15 minutes ago • 1,234,567 records processed</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Duration</span>
                  </div>
                  <p className="text-2xl font-bold">11m 23s</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                  </div>
                  <p className="text-2xl font-bold">98.7%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution History */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent pipeline runs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Run ID</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Start Time</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Records</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {executionHistory.map((run) => (
                  <tr key={run.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-3 font-mono text-sm">{run.id}</td>
                    <td className="p-3">
                      <Badge className={run.status === "completed" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}>
                        {run.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{run.startTime}</td>
                    <td className="p-3 text-sm">{run.duration}</td>
                    <td className="p-3 text-sm font-medium">{run.records}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm">View Logs</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Live Logs */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription>Real-time pipeline output</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-muted-foreground">{log.time}</span>
                <span className={log.level === "ERROR" ? "text-destructive" : "text-success"}>[{log.level}]</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
