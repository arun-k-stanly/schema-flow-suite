import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiGenerateModel, apiGenerateCode } from "@/lib/api";

export default function BuildPipeline() {
  const { toast } = useToast();
  const [code, setCode] = useState<string>("");
  const [inputFormat, setInputFormat] = useState<'json' | 'xml' | 'csv' | 'parquet' | 'avro'>("json");
  const [inputPath, setInputPath] = useState<string>("input.json");
  const [csvHeader, setCsvHeader] = useState<boolean>(true);
  const [csvInferSchema, setCsvInferSchema] = useState<boolean>(true);
  const [adlsEnabled, setAdlsEnabled] = useState<boolean>(false);
  const [adlsAccount, setAdlsAccount] = useState<string>("");
  const [adlsContainer, setAdlsContainer] = useState<string>("");
  const [adlsKey, setAdlsKey] = useState<string>("");
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Build Data Pipeline</h2>
        <p className="text-muted-foreground">Generate PySpark code based on your data model</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Pipeline Actions */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Pipeline Actions</CardTitle>
            <CardDescription>Control your ETL workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" size="lg" onClick={async () => {
              try {
                const { model } = await apiGenerateModel();
                const inputOptions: Record<string, any> = {};
                if (inputFormat === 'csv') {
                  inputOptions.header = csvHeader;
                  inputOptions.inferSchema = csvInferSchema;
                }
                const adlsConfig = adlsEnabled ? { enabled: true, account_name: adlsAccount, account_key: adlsKey, container: adlsContainer } : undefined;
                const res = await apiGenerateCode(model, inputFormat, inputPath, inputOptions, adlsConfig);
                setCode(res.code);
                toast({ title: "Code generated", description: "PySpark ETL created" });
              } catch (e: any) {
                toast({ title: "Generation failed", description: e.message, variant: "destructive" });
              }
            }}>
              <Code className="w-4 h-4 mr-2" />
              Generate PySpark Code
            </Button>
            <Button variant="outline" className="w-full" onClick={() => {
              if (!code) return;
              const blob = new Blob([code], { type: 'text/x-python' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'pipeline.py';
              a.click();
            }} disabled={!code}>
              <Download className="w-4 h-4 mr-2" />
              Download Code
            </Button>
            
          </CardContent>
        </Card>

        {/* Code View */}
        <Card className="lg:col-span-3 shadow-card border-border">
          <CardHeader>
            <CardTitle>Pipeline Code</CardTitle>
            <CardDescription>Code preview will appear after model is defined</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pyspark">
              <TabsList className="mb-4">
                <TabsTrigger value="pyspark">PySpark Code</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pyspark">
                <div className="bg-muted rounded-lg p-4">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Generated PySpark code will appear here. You can edit it manually."
                    className="min-h-[420px] font-mono text-xs"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="config">
                <div className="bg-muted rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Input Format</label>
                      <Select value={inputFormat} onValueChange={(v: any) => {
                        setInputFormat(v);
                        const defaults: any = { json: 'input.json', xml: 'input.xml', csv: 'input.csv', parquet: 'input.parquet', avro: 'input.avro' };
                        setInputPath(defaults[v] || 'input.json');
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="parquet">Parquet</SelectItem>
                          <SelectItem value="avro">Avro</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">XML requires spark-xml, Avro requires spark-avro in your runtime.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Input File Path</label>
                      <Input
                        value={inputPath}
                        onChange={(e) => setInputPath(e.target.value)}
                        placeholder={{ json: 'input.json', xml: 'input.xml', csv: 'input.csv', parquet: 'input.parquet', avro: 'input.avro' }[inputFormat]}
                      />
                      <p className="text-xs text-muted-foreground">Provide a local/remote path readable by your Spark cluster.</p>
                    </div>
                    {inputFormat === 'csv' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CSV Options</label>
                        <div className="flex items-center gap-3">
                          <Switch checked={csvHeader} onCheckedChange={setCsvHeader} />
                          <span className="text-sm">Header</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch checked={csvInferSchema} onCheckedChange={setCsvInferSchema} />
                          <span className="text-sm">Infer Schema</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Read from ADLS Gen2</label>
                      <div className="flex items-center gap-3">
                        <Switch checked={adlsEnabled} onCheckedChange={setAdlsEnabled} />
                        <span className="text-sm">Enable</span>
                      </div>
                      {adlsEnabled && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                          <Input placeholder="Account Name" value={adlsAccount} onChange={(e) => setAdlsAccount(e.target.value)} />
                          <Input placeholder="Container" value={adlsContainer} onChange={(e) => setAdlsContainer(e.target.value)} />
                          <Input placeholder="Account Key (or use cluster creds)" value={adlsKey} onChange={(e) => setAdlsKey(e.target.value)} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder guidance */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>Define a data model to enable code generation</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
