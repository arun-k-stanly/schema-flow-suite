import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileCode, Play, Download, Sparkles } from "lucide-react";
import { useState } from "react";
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

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setXmlContent(sampleXML);
      setIsGenerating(false);
      toast({
        title: "XML Generated",
        description: "Sample XML has been generated based on your XSD schema.",
      });
    }, 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-sales-promotion.xml";
    a.click();
    toast({
      title: "Downloaded",
      description: "XML file has been downloaded.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Generate Sample XML</h2>
        <p className="text-muted-foreground">Create sample XML files for testing based on your XSD schema</p>
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
                  Generate XML
                </>
              )}
            </Button>

            {xmlContent && (
              <Button 
                onClick={handleDownload}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download XML
              </Button>
            )}
          </CardContent>
        </Card>

        {/* XML Preview */}
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated XML</CardTitle>
                <CardDescription>Preview and edit your sample data</CardDescription>
              </div>
              <FileCode className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={xmlContent}
              onChange={(e) => setXmlContent(e.target.value)}
              placeholder="Click 'Generate XML' to create sample data..."
              className="min-h-[500px] font-mono text-sm bg-muted"
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {xmlContent && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Lines</p>
              <p className="text-2xl font-bold">{xmlContent.split('\n').length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Size</p>
              <p className="text-2xl font-bold">{(new Blob([xmlContent]).size / 1024).toFixed(1)} KB</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Elements</p>
              <p className="text-2xl font-bold">{(xmlContent.match(/<[^/][^>]*>/g) || []).length}</p>
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
