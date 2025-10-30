import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

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

export default function Validation() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Source-to-Target Validation</h2>
        <p className="text-muted-foreground">Comprehensive data validation across all levels</p>
      </div>

      {/* Overall Summary */}
      <Card className="shadow-card border-border bg-gradient-card">
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
                        <Badge className="bg-success/20 text-success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Match
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/20 text-warning">
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
    </div>
  );
}
