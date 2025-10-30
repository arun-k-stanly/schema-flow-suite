import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, GitBranch, Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const factTable = {
  name: "fact_sales_promotions",
  type: "Fact Table",
  columns: [
    { name: "transaction_id", type: "INTEGER", key: "PK" },
    { name: "campaign_id", type: "INTEGER", key: "FK" },
    { name: "product_id", type: "INTEGER", key: "FK" },
    { name: "customer_id", type: "INTEGER", key: "FK" },
    { name: "date_id", type: "INTEGER", key: "FK" },
    { name: "quantity", type: "INTEGER", key: "" },
    { name: "revenue", type: "DECIMAL", key: "" },
    { name: "discount_amount", type: "DECIMAL", key: "" },
  ]
};

const dimensionTables = [
  {
    name: "dim_campaign",
    columns: [
      { name: "campaign_id", type: "INTEGER", key: "PK" },
      { name: "campaign_name", type: "VARCHAR", key: "" },
      { name: "start_date", type: "DATE", key: "" },
      { name: "end_date", type: "DATE", key: "" },
      { name: "budget", type: "DECIMAL", key: "" },
      { name: "discount_percentage", type: "DECIMAL", key: "" },
    ]
  },
  {
    name: "dim_product",
    columns: [
      { name: "product_id", type: "INTEGER", key: "PK" },
      { name: "product_name", type: "VARCHAR", key: "" },
      { name: "category", type: "VARCHAR", key: "" },
      { name: "price", type: "DECIMAL", key: "" },
    ]
  },
  {
    name: "dim_customer",
    columns: [
      { name: "customer_id", type: "INTEGER", key: "PK" },
      { name: "customer_name", type: "VARCHAR", key: "" },
      { name: "email", type: "VARCHAR", key: "" },
      { name: "segment", type: "VARCHAR", key: "" },
    ]
  },
  {
    name: "dim_date",
    columns: [
      { name: "date_id", type: "INTEGER", key: "PK" },
      { name: "full_date", type: "DATE", key: "" },
      { name: "year", type: "INTEGER", key: "" },
      { name: "quarter", type: "INTEGER", key: "" },
      { name: "month", type: "INTEGER", key: "" },
    ]
  },
];

export default function DataModel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Data Model - Star Schema</h2>
        <p className="text-muted-foreground">Automatically generated fact and dimension tables from your XML data</p>
      </div>

      {/* Schema Type */}
      <Card className="shadow-card border-border bg-gradient-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Star Schema Model</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for sales promotion analytics with 1 fact table and 4 dimension tables
              </p>
            </div>
            <Button>Generate SQL DDL</Button>
          </div>
        </CardContent>
      </Card>

      {/* Fact Table */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {factTable.name}
              </CardTitle>
              <CardDescription>Central fact table for sales promotion transactions</CardDescription>
            </div>
            <Badge className="bg-primary/20 text-primary">Fact Table</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Column Name</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data Type</th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Key</th>
                </tr>
              </thead>
              <tbody>
                {factTable.columns.map((col, idx) => (
                  <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="p-3 font-mono text-sm">{col.name}</td>
                    <td className="p-3 text-sm text-muted-foreground">{col.type}</td>
                    <td className="p-3">
                      {col.key && (
                        <Badge variant="outline" className="text-xs">
                          {col.key}
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

      {/* Dimension Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dimensionTables.map((table, idx) => (
          <Card key={idx} className="shadow-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Table className="w-4 h-4 text-secondary" />
                    {table.name}
                  </CardTitle>
                </div>
                <Badge className="bg-secondary/20 text-secondary">Dimension</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Column</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((col, colIdx) => (
                      <tr key={colIdx} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-2 font-mono text-xs">{col.name}</td>
                        <td className="p-2 text-xs text-muted-foreground">{col.type}</td>
                        <td className="p-2">
                          {col.key && (
                            <Badge variant="outline" className="text-xs">
                              {col.key}
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
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Tables</p>
            <p className="text-2xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Fact Tables</p>
            <p className="text-2xl font-bold">1</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Dimension Tables</p>
            <p className="text-2xl font-bold">4</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Columns</p>
            <p className="text-2xl font-bold">24</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
