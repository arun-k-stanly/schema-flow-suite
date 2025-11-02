import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileCode, Play, Download, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const sampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<SalesPromotion>
  <Campaign>
    <CampaignID>PROMO2024Q1</CampaignID>
    <Name>Spring Sale 2024</Name>
    <StartDate>2024-03-01</StartDate>
    <EndDate>2024-03-31</EndDate>
    <Budget>50000.00</Budget>
    <DiscountPercentage>25</DiscountPercentage>
  </Campaign>
  <Products>
    <Product>
      <ProductID>PROD001</ProductID>
      <ProductName>Wireless Headphones</ProductName>
      <Category>Electronics</Category>
      <Price>149.99</Price>
      <Stock>500</Stock>
    </Product>
    <Product>
      <ProductID>PROD002</ProductID>
      <ProductName>Smart Watch</ProductName>
      <Category>Electronics</Category>
      <Price>299.99</Price>
      <Stock>250</Stock>
    </Product>
  </Products>
  <Customers>
    <Customer>
      <CustomerID>CUST12345</CustomerID>
      <Name>John Doe</Name>
      <Email>john.doe@example.com</Email>
      <Segment>Premium</Segment>
    </Customer>
  </Customers>
</SalesPromotion>`;

export default function GenerateXML() {
  const [xmlContent, setXmlContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [format, setFormat] = useState<"xml" | "json" | "csv" | "table">("xml");

  const sampleJSON = useMemo(() => {
    return JSON.stringify({
      SalesPromotion: {
        Campaign: {
          CampaignID: "PROMO2024Q1",
          Name: "Spring Sale 2024",
          StartDate: "2024-03-01",
          EndDate: "2024-03-31",
          Budget: 50000.0,
          DiscountPercentage: 25,
        },
        Products: [
          { ProductID: "PROD001", ProductName: "Wireless Headphones", Category: "Electronics", Price: 149.99, Stock: 500 },
          { ProductID: "PROD002", ProductName: "Smart Watch", Category: "Electronics", Price: 299.99, Stock: 250 },
        ],
        Customers: [
          { CustomerID: "CUST12345", Name: "John Doe", Email: "john.doe@example.com", Segment: "Premium" },
        ],
      },
    }, null, 2);
  }, []);

  const tableRows = useMemo(() => (
    [
      { transaction_id: 1, product: "Wireless Headphones", price: 149.99, quantity: 2, revenue: 299.98 },
      { transaction_id: 2, product: "Smart Watch", price: 299.99, quantity: 1, revenue: 299.99 },
    ]
  ), []);

  const sampleCSV = useMemo(() => {
    const header = "transaction_id,product,price,quantity,revenue";
    const rows = tableRows.map(r => `${r.transaction_id},${r.product},${r.price},${r.quantity},${r.revenue}`);
    return [header, ...rows].join("\n");
  }, [tableRows]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (format === "xml") {
        setXmlContent(sampleXML);
      } else if (format === "json") {
        setXmlContent(sampleJSON);
      } else if (format === "csv") {
        setXmlContent(sampleCSV);
      } else {
        setXmlContent("");
      }
      setIsGenerating(false);
      toast({
        title: "Sample Data Generated",
        description: `Generated ${format.toUpperCase()} sample data`,
      });
    }, 1500);
  };

  const handleDownload = () => {
    const mimeByFormat: Record<string, string> = {
      xml: "text/xml",
      json: "application/json",
      csv: "text/csv",
      table: "text/csv",
    };
    const content = format === "table" ? sampleCSV : xmlContent;
    const blob = new Blob([content], { type: mimeByFormat[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ext = format === "table" ? "csv" : format;
    a.download = `sample-data.${ext}`;
    a.click();
    toast({
      title: "Downloaded",
      description: "Sample data file has been downloaded.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Generate Sample Data</h2>
        <p className="text-muted-foreground">Create sample data for testing based on your schema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Generation Options</CardTitle>
            <CardDescription>Configure your sample data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <Select value={format} onValueChange={(v:any) => setFormat(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Records</label>
              <input
                type="number"
                defaultValue={5}
                className="w-full px-3 py-2 bg-muted rounded-lg border border-border"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Variation</label>
              <select className="w-full px-3 py-2 bg-muted rounded-lg border border-border">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Sample Data
                </>
              )}
            </Button>

            {(xmlContent || format === "table") && (
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Data
              </Button>
            )}
          </CardContent>
        </Card>

        {/* XML Preview */}
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Sample Data</CardTitle>
                <CardDescription>Preview and edit your sample data</CardDescription>
              </div>
              <FileCode className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {format === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">transaction_id</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">product</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">price</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">quantity</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((r, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="p-2 text-xs font-mono">{r.transaction_id}</td>
                        <td className="p-2 text-xs font-mono">{r.product}</td>
                        <td className="p-2 text-xs font-mono">{r.price}</td>
                        <td className="p-2 text-xs font-mono">{r.quantity}</td>
                        <td className="p-2 text-xs font-mono">{r.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Textarea
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                placeholder="Click 'Generate Sample Data' to create sample data..."
                className="min-h-[500px] font-mono text-sm bg-muted"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {(xmlContent || format === "table") && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Lines</p>
              <p className="text-2xl font-bold">{format === "table" ? tableRows.length + 1 : xmlContent.split('\n').length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Size</p>
              <p className="text-2xl font-bold">{(new Blob([format === "table" ? sampleCSV : xmlContent]).size / 1024).toFixed(1)} KB</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Elements</p>
              <p className="text-2xl font-bold">{format === "xml" ? (xmlContent.match(/<[^/][^>]*>/g) || []).length : format === "json" ? (sampleJSON.match(/:\s*\{/g) || []).length + (sampleJSON.match(/\[/g) || []).length : format === "csv" ? (xmlContent.split('\n')[0]?.split(',').length || 0) : tableRows.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className="text-2xl font-bold text-success">Valid</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
