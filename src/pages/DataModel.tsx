import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, GitBranch, Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataModelDiagram, { StarSchemaModel } from "@/components/DataModelDiagram";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

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
  const [searchParams] = useSearchParams();
  const pipelineId = searchParams.get('pipeline');
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [factTableState, setFactTableState] = useState(factTable);
  const [dimensionTablesState, setDimensionTablesState] = useState(dimensionTables);

  function generateModelFromPrompt(text: string): StarSchemaModel {
    const lower = text.toLowerCase();
    if (lower.includes("ecommerce") || lower.includes("order")) {
      return {
        fact: {
          name: "fact_orders",
          columns: [
            { name: "order_id", type: "INTEGER", key: "PK" },
            { name: "customer_id", type: "INTEGER", key: "FK" },
            { name: "product_id", type: "INTEGER", key: "FK" },
            { name: "date_id", type: "INTEGER", key: "FK" },
            { name: "store_id", type: "INTEGER", key: "FK" },
            { name: "quantity", type: "INTEGER" },
            { name: "unit_price", type: "DECIMAL" },
            { name: "revenue", type: "DECIMAL" },
            { name: "discount", type: "DECIMAL" },
          ],
        },
        dimensions: [
          { name: "dim_customer", columns: [
            { name: "customer_id", type: "INTEGER", key: "PK" },
            { name: "customer_name", type: "VARCHAR" },
            { name: "email", type: "VARCHAR" },
            { name: "segment", type: "VARCHAR" },
          ]},
          { name: "dim_product", columns: [
            { name: "product_id", type: "INTEGER", key: "PK" },
            { name: "product_name", type: "VARCHAR" },
            { name: "category", type: "VARCHAR" },
            { name: "price", type: "DECIMAL" },
          ]},
          { name: "dim_store", columns: [
            { name: "store_id", type: "INTEGER", key: "PK" },
            { name: "store_name", type: "VARCHAR" },
            { name: "region", type: "VARCHAR" },
          ]},
          { name: "dim_date", columns: [
            { name: "date_id", type: "INTEGER", key: "PK" },
            { name: "full_date", type: "DATE" },
            { name: "year", type: "INTEGER" },
            { name: "month", type: "INTEGER" },
            { name: "day", type: "INTEGER" },
          ]},
        ],
      };
    }

    if (lower.includes("healthcare") || lower.includes("patient") || lower.includes("hospital")) {
      return {
        fact: {
          name: "fact_patient_visits",
          columns: [
            { name: "visit_id", type: "INTEGER", key: "PK" },
            { name: "patient_id", type: "INTEGER", key: "FK" },
            { name: "provider_id", type: "INTEGER", key: "FK" },
            { name: "facility_id", type: "INTEGER", key: "FK" },
            { name: "date_id", type: "INTEGER", key: "FK" },
            { name: "diagnosis_code", type: "VARCHAR" },
            { name: "charge_amount", type: "DECIMAL" },
          ],
        },
        dimensions: [
          { name: "dim_patient", columns: [
            { name: "patient_id", type: "INTEGER", key: "PK" },
            { name: "full_name", type: "VARCHAR" },
            { name: "gender", type: "VARCHAR" },
            { name: "age", type: "INTEGER" },
          ]},
          { name: "dim_provider", columns: [
            { name: "provider_id", type: "INTEGER", key: "PK" },
            { name: "provider_name", type: "VARCHAR" },
            { name: "specialty", type: "VARCHAR" },
          ]},
          { name: "dim_facility", columns: [
            { name: "facility_id", type: "INTEGER", key: "PK" },
            { name: "facility_name", type: "VARCHAR" },
            { name: "city", type: "VARCHAR" },
          ]},
          { name: "dim_date", columns: [
            { name: "date_id", type: "INTEGER", key: "PK" },
            { name: "full_date", type: "DATE" },
            { name: "year", type: "INTEGER" },
            { name: "month", type: "INTEGER" },
          ]},
        ],
      };
    }

    // Default to the existing sales promotion model
    return {
      fact: factTable,
      dimensions: dimensionTables,
    };
  }

  const modelForDiagram = useMemo<StarSchemaModel>(() => ({
    fact: factTableState,
    dimensions: dimensionTablesState,
  }), [factTableState, dimensionTablesState]);

  const totalColumns = useMemo(() => (
    factTableState.columns.length + dimensionTablesState.reduce((sum, t) => sum + t.columns.length, 0)
  ), [factTableState.columns.length, dimensionTablesState]);

  function handleGenerate() {
    const result = generateModelFromPrompt(prompt);
    setFactTableState(result.fact as any);
    setDimensionTablesState(result.dimensions as any);
    toast({ title: "Model generated", description: "Updated model based on your prompt." });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Data Model - Star Schema</h2>
        <p className="text-muted-foreground">
          {pipelineId 
            ? `Generated from Pipeline #${pipelineId} - Campaign Analysis Pipeline` 
            : "Automatically generated fact and dimension tables from your XML data"
          }
        </p>
      </div>

      {/* Prompt-based generation */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Generate from Prompt</CardTitle>
          <CardDescription>Describe your domain (e.g., "ecommerce orders", "healthcare patient visits").</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a prompt to generate a star schema..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleGenerate} disabled={!prompt.trim()}>Generate Model</Button>
          </div>
        </CardContent>
      </Card>

      {/* Schema Type */}
      <Card className="shadow-card border-border">
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

      {/* Interactive Diagram & Table View */}
      <Tabs defaultValue="diagram" className="w-full">
        <TabsList>
          <TabsTrigger value="diagram">Interactive Diagram</TabsTrigger>
          <TabsTrigger value="tables">Table Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagram" className="mt-6">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle>Star Schema Architecture</CardTitle>
              <CardDescription>Interactive visualization of fact and dimension tables with relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <DataModelDiagram model={modelForDiagram} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="mt-6 space-y-6">
      {/* Fact Table */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {factTableState.name}
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
                {factTableState.columns.map((col, idx) => (
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
        {dimensionTablesState.map((table, idx) => (
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
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Tables</p>
            <p className="text-2xl font-bold">{1 + dimensionTablesState.length}</p>
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
            <p className="text-2xl font-bold">{dimensionTablesState.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Columns</p>
            <p className="text-2xl font-bold">{totalColumns}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
