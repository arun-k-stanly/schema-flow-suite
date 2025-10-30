import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertCircle, Play, FileCheck } from "lucide-react";

const validationResults = {
  tableLevel: [
    { table: "fact_sales_promotions", source: 1234567, target: 1234567, match: true },
    { table: "dim_campaign", source: 45, target: 45, match: true },
    { table: "dim_product", source: 2340, target: 2340, match: true },
    { table: "dim_customer", source: 89234, target: 89220, match: false },
    { table: "dim_date", source: 365, target: 365, match: true },
  ],
  columnLevel: [
    { table: "fact_sales_promotions", column: "transaction_id", sourceType: "INTEGER", targetType: "INTEGER", match: true },
    { table: "fact_sales_promotions", column: "revenue", sourceType: "DECIMAL", targetType: "DECIMAL", match: true },
    { table: "dim_customer", column: "email", sourceType: "VARCHAR", targetType: "VARCHAR", match: true },
    { table: "dim_product", column: "price", sourceType: "DECIMAL", targetType: "FLOAT", match: false },
  ],
  rowLevel: {
    totalRows: 1234567,
    matchedRows: 1234223,
    mismatchedRows: 344,
    matchPercentage: 99.97,
  }
};

const dataQualityMetrics = [
  { name: "Completeness", score: 98.5, status: "pass", issues: 234 },
  { name: "Accuracy", score: 99.2, status: "pass", issues: 89 },
  { name: "Consistency", score: 97.8, status: "warning", issues: 456 },
  { name: "Validity", score: 99.8, status: "pass", issues: 23 },
  { name: "Uniqueness", score: 100, status: "pass", issues: 0 },
  { name: "Timeliness", score: 96.5, status: "warning", issues: 567 },
];

const qualityIssues = [
  { table: "fact_sales_promotions", column: "quantity", issue: "Null Values", count: 145, severity: "high" },
  { table: "dim_customer", column: "email", issue: "Invalid Format", count: 89, severity: "medium" },
  { table: "dim_product", column: "price", issue: "Outliers Detected", count: 23, severity: "low" },
  { table: "fact_sales_promotions", column: "revenue", issue: "Negative Values", count: 12, severity: "high" },
  { table: "dim_campaign", column: "end_date", issue: "Future Dates", count: 5, severity: "medium" },
];

export default function ValidationNew() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Validation & Data Quality</h2>
        <p className="text-muted-foreground">Comprehensive validation across source-to-target and data quality dimensions</p>
      </div>

      {/* Validation Tabs */}
      <Tabs defaultValue="source-target" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="source-target" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Source-to-Target Validation
          </TabsTrigger>
          <TabsTrigger value="data-quality" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Data Quality Report
          </TabsTrigger>
        </TabsList>

        {/* Source-to-Target Validation Tab */}
        <TabsContent value="source-target" className="space-y-6 mt-6">
          {/* Overall Summary */}
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">Validation Passed</h3>
                  <p className="text-muted-foreground">Overall data match: 99.97% • 2 minor discrepancies found</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Last Validated</p>
                  <p className="font-medium">15 minutes ago</p>
                </div>
                <Button size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Run Validation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table Level Validation */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle>Table-Level Validation</CardTitle>
              <CardDescription>Row count comparison between source and target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Table Name</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Source Rows</th>
                      <th className="text-right p-3 text-sm font-medium text-muted-foreground">Target Rows</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResults.tableLevel.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-3 font-mono text-sm">{row.table}</td>
                        <td className="p-3 text-right font-medium">{row.source.toLocaleString()}</td>
                        <td className="p-3 text-right font-medium">{row.target.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          {row.match ? (
                            <Badge className="bg-success/20 text-success border-success/20">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Match
                            </Badge>
                          ) : (
                            <Badge className="bg-warning/20 text-warning border-warning/20">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Mismatch
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Column Level Validation */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle>Column-Level Validation</CardTitle>
              <CardDescription>Schema structure consistency check</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Table</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Column</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Source Type</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Target Type</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResults.columnLevel.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-3 font-mono text-xs">{row.table}</td>
                        <td className="p-3 font-mono text-sm">{row.column}</td>
                        <td className="p-3 text-sm text-muted-foreground">{row.sourceType}</td>
                        <td className="p-3 text-sm text-muted-foreground">{row.targetType}</td>
                        <td className="p-3 text-center">
                          {row.match ? (
                            <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-warning mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Row Level Validation */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle>Row-Level Validation</CardTitle>
              <CardDescription>Data matching and mismatch summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Rows</p>
                    <p className="text-2xl font-bold">{validationResults.rowLevel.totalRows.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Matched Rows</p>
                    <p className="text-2xl font-bold text-success">{validationResults.rowLevel.matchedRows.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Mismatched Rows</p>
                    <p className="text-2xl font-bold text-warning">{validationResults.rowLevel.mismatchedRows.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">Match %</p>
                    <p className="text-2xl font-bold text-success">{validationResults.rowLevel.matchPercentage}%</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Quality Report Tab */}
        <TabsContent value="data-quality" className="space-y-6 mt-6">
          {/* Overall DQ Summary */}
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">Overall Data Quality Score</h3>
                  <p className="text-muted-foreground">Average quality score across all dimensions</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">98.6%</p>
                  <Badge className="mt-2 bg-success/20 text-success border-success/20">Excellent</Badge>
                </div>
                <Button size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Run DQ Check
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* DQ Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataQualityMetrics.map((metric, idx) => (
              <Card key={idx} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{metric.name}</p>
                    {metric.status === "pass" ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <p className="text-2xl font-bold mb-1">{metric.score}%</p>
                  <p className="text-xs text-muted-foreground">{metric.issues} issues found</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* DQ Issues Table */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle>Data Quality Issues</CardTitle>
              <CardDescription>Detailed breakdown of identified quality issues</CardDescription>
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
                    {qualityIssues.map((issue, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-3 font-mono text-xs">{issue.table}</td>
                        <td className="p-3 font-mono text-sm">{issue.column}</td>
                        <td className="p-3 text-sm">{issue.issue}</td>
                        <td className="p-3 text-right font-medium">{issue.count}</td>
                        <td className="p-3 text-center">
                          <Badge 
                            variant="outline"
                            className={
                              issue.severity === "high" 
                                ? "bg-destructive/20 text-destructive border-destructive/20"
                                : issue.severity === "medium"
                                ? "bg-warning/20 text-warning border-warning/20"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {issue.severity}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
