import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, AlertTriangle } from "lucide-react";

const qualityMetrics = {
  overallScore: 98.5,
  metrics: [
    { name: "Completeness", score: 99.2, status: "excellent" },
    { name: "Accuracy", score: 98.8, status: "excellent" },
    { name: "Consistency", score: 97.5, status: "good" },
    { name: "Timeliness", score: 99.9, status: "excellent" },
    { name: "Validity", score: 96.8, status: "good" },
    { name: "Uniqueness", score: 99.5, status: "excellent" },
  ],
  issues: [
    { table: "dim_customer", column: "email", issue: "Null Values", count: 142, severity: "medium" },
    { table: "fact_sales", column: "quantity", issue: "Outliers", count: 23, severity: "low" },
    { table: "dim_product", column: "price", issue: "Duplicates", count: 8, severity: "low" },
  ]
};

export default function DataQuality() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Data Quality Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive data quality metrics and validation results</p>
      </div>

      {/* Overall Score */}
      <Card className="shadow-card border-border bg-gradient-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-success">{qualityMetrics.overallScore}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Shield className="w-6 h-6 text-success" />
                Excellent Data Quality
              </h3>
              <p className="text-muted-foreground mb-3">Your data meets high quality standards across all dimensions</p>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>+2.3% from last week</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span>3 minor issues detected</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Dimensions */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Quality Dimensions</CardTitle>
          <CardDescription>Detailed scores across data quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qualityMetrics.metrics.map((metric, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{metric.name}</span>
                  <span className="text-sm font-bold">{metric.score}%</span>
                </div>
                <Progress value={metric.score} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Status: <span className={metric.status === "excellent" ? "text-success" : "text-warning"}>{metric.status}</span>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues Table */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Data Quality Issues</CardTitle>
          <CardDescription>Identified issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Table</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Column</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Issue Type</th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">Count</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Severity</th>
                </tr>
              </thead>
              <tbody>
                {qualityMetrics.issues.map((issue, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-3 font-mono text-sm">{issue.table}</td>
                    <td className="p-3 font-mono text-sm">{issue.column}</td>
                    <td className="p-3 text-sm">{issue.issue}</td>
                    <td className="p-3 text-right font-medium">{issue.count}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        issue.severity === "high" ? "bg-destructive/20 text-destructive" :
                        issue.severity === "medium" ? "bg-warning/20 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {issue.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Null Values</p>
            <p className="text-2xl font-bold">142</p>
            <p className="text-xs text-warning mt-1">0.01% of total</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Duplicates</p>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-success mt-1">0.0006% of total</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Outliers</p>
            <p className="text-2xl font-bold">23</p>
            <p className="text-xs text-success mt-1">0.002% of total</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Format Errors</p>
            <p className="text-2xl font-bold text-success">0</p>
            <p className="text-xs text-success mt-1">Perfect!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
