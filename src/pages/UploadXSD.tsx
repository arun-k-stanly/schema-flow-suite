import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiParseMetadata } from "@/lib/api";

export default function UploadXSD() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const { toast } = useToast();
  const [format, setFormat] = useState<string>("xsd");
  const [preview, setPreview] = useState<any | null>(null);

  const formatLabel: Record<string, string> = {
    xsd: "XSD",
    json: "JSON Schema",
    avro: "Avro Schema",
    parquet: "Parquet",
    csv: "CSV Header",
    yaml: "YAML",
  };

  const acceptByFormat: Record<string, string> = {
    xsd: ".xsd",
    json: ".json",
    avro: ".avsc,.json",
    parquet: ".parquet",
    csv: ".csv",
    yaml: ".yaml,.yml",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsUploaded(false);
    }
  };

  const handleUpload = () => {
    if (file) {
      (async () => {
        try {
          const res = await apiParseMetadata(format, file);
          setPreview(res.summary);
          try { localStorage.setItem('schemaPreview', JSON.stringify(res.summary)); } catch {}
          setIsUploaded(true);
          toast({ title: "Parsed Successfully", description: `File "${file.name}" processed.` });
        } catch (e: any) {
          setPreview(null);
          setIsUploaded(false);
          toast({ title: "Parse failed", description: e.message, variant: "destructive" });
        }
      })();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Upload Metadata</h2>
        <p className="text-muted-foreground">Upload your metadata to begin the workflow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Card */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Metadata Upload</CardTitle>
                <CardDescription>Select and upload your metadata file</CardDescription>
              </div>
              <div className="w-56">
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xsd">XSD</SelectItem>
                    <SelectItem value="json">JSON Schema</SelectItem>
                    <SelectItem value="avro">Avro</SelectItem>
                    <SelectItem value="parquet">Parquet</SelectItem>
                    <SelectItem value="csv">CSV Header</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept={acceptByFormat[format]}
                onChange={handleFileChange}
                className="hidden"
                id="xsd-upload"
              />
              <label htmlFor="xsd-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">Format: {formatLabel[format]} • Accepted: {acceptByFormat[format]}</p>
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                {isUploaded && <Check className="w-5 h-5 text-success" />}
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploaded}
              className="w-full"
              size="lg"
            >
              {isUploaded ? "Uploaded" : "Upload File"}
            </Button>
          </CardContent>
        </Card>

        {/* Schema Preview */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Schema Structure</CardTitle>
            <CardDescription>Parsed {formatLabel[format]} schema will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isUploaded && preview ? (
              <div className="space-y-3">
                {(preview.elements || []).map((el: any, idx: number) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                    <p className="font-mono text-sm font-medium">{el.name}</p>
                    {el.children && el.children.length > 0 ? (
                      <div className="ml-4 mt-2 space-y-1">
                        {el.children.map((c: any, cidx: number) => {
                          const label = typeof c === 'string' ? c : (c?.name ?? '');
                          return (
                            <div key={cidx} className="p-2 bg-muted/50 rounded">
                              <p className="font-mono text-xs">{label}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No child elements detected</p>
                    )}
                  </div>
                ))}
                {(preview.elements || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No top-level elements found.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Upload a {formatLabel[format]} file to view its structure</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">Supported Format</h4>
            <p className="text-xs text-muted-foreground">XSD, JSON Schema, Avro, Parquet, CSV, YAML</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">Max File Size</h4>
            <p className="text-xs text-muted-foreground">10 MB</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <h4 className="font-medium text-sm mb-2">Processing Time</h4>
            <p className="text-xs text-muted-foreground">~2-5 seconds</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
