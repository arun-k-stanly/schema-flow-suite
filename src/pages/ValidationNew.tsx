import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, AlertCircle, Play, FileCheck } from "lucide-react";
import { apiValidationCheck } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type SimpleValidation = { valid: boolean; reasons?: string[] } | null;

const dqTests = [
  { id: "DQ-001", name: "Completeness >= 98%", dimension: "Completeness", assertion: ">= 98%", status: "pass", severity: "high" },
  { id: "DQ-002", name: "Accuracy >= 99%", dimension: "Accuracy", assertion: ">= 99%", status: "pass", severity: "high" },
  { id: "DQ-003", name: "Email format valid", dimension: "Validity", assertion: "email matches RFC5322", status: "warning", severity: "medium" },
  { id: "DQ-004", name: "Price non-negative", dimension: "Validity", assertion: "price >= 0", status: "pass", severity: "high" },
  { id: "DQ-005", name: "No duplicate transaction_id", dimension: "Uniqueness", assertion: "COUNT == COUNT(DISTINCT)", status: "pass", severity: "high" },
];

export default function ValidationNew() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimpleValidation>(null);

  async function runValidation() {
    setRunning(true);
    try {
      const res = await apiValidationCheck({});
      setResult({ valid: res.valid, reasons: res.reasons });
      if (res.valid) {
        toast({ title: "Validation Passed", description: "Backend validation returned valid=true" });
      } else {
        toast({ title: "Validation Failed", description: res.reasons?.join(", ") || "" , variant: "destructive"});
      }
    } catch (e: any) {
      toast({ title: "Validation error", description: e.message, variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }

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
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">Source-to-Target Validation</h3>
                  <p className="text-muted-foreground">Run backend validation checks</p>
                </div>
                <Button size="lg" onClick={runValidation} disabled={running}>
                  <Play className="w-4 h-4 mr-2" />
                  {running ? "Running..." : "Run Validation"}
                </Button>
              </div>
              {result !== null && (
                <div className="mt-4 p-4 rounded-lg border" style={{ borderColor: result.valid ? 'var(--success-500)' : 'var(--destructive-500)' }}>
                  <p className="text-sm font-medium">{result.valid ? 'Validation passed' : 'Validation failed'}</p>
                  {!result.valid && result.reasons?.length ? (
                    <p className="text-xs text-muted-foreground mt-1">{result.reasons.join(', ')}</p>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional detailed results can appear here when backend provides them */}

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

        <TabsContent value="source-target" className="space-y-6 mt-0" />

        <TabsContent value="data-quality" className="space-y-6 mt-6">
          <Card className="shadow-card border-border">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">No data quality results yet. Run validation to populate results.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
