import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileCode, Play, Download, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiGenerateSample } from "@/lib/api";

export default function GenerateXML() {
  const [xmlContent, setXmlContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [format, setFormat] = useState<"xml" | "json" | "csv" | "table">("xml");

  const [tableRows, setTableRows] = useState<any[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      let schema: any = null;
      try { schema = JSON.parse(localStorage.getItem('schemaPreview') || 'null'); } catch {}
      const res = await apiGenerateSample({ format, count: 5, variation: 'low', schema });
      if (format === 'table') {
        setTableRows(Array.isArray(res.rows) ? res.rows : []);
        setXmlContent("");
      } else if (format === 'json') {
        setXmlContent(JSON.stringify(res.content ?? res, null, 2));
      } else {
        setXmlContent(res.content ?? '');
      }
      toast({ title: "Sample Data Generated", description: `Generated ${format.toUpperCase()} sample data` });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const mimeByFormat: Record<string, string> = {
      xml: "text/xml",
      json: "application/json",
      csv: "text/csv",
      table: "text/csv",
    };
    const content = xmlContent;
    const blob = new Blob([content], { type: mimeByFormat[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ext = format === "table" ? "csv" : format;
    a.download = `data.${ext}`;
    a.click();
    toast({
      title: "Downloaded",
      description: "Data file has been downloaded.",
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
              tableRows.length === 0 ? (
                <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">No table data generated.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {Object.keys(tableRows[0]).map((key) => (
                          <th key={key} className="text-left p-2 text-xs font-medium text-muted-foreground">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                          {Object.keys(tableRows[0]).map((key) => (
                            <td key={key} className="p-2 text-xs font-mono">{String(row[key])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <Textarea
                value={xmlContent}
                onChange={(e) => setXmlContent(e.target.value)}
                placeholder="Click 'Generate Data' to create data once configured..."
                className="min-h-[500px] font-mono text-sm bg-muted"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      {false && <div />}
    </div>
  );
}
