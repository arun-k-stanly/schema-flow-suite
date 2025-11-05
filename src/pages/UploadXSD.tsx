import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Check, AlertCircle, ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiParseMetadata } from "@/lib/api";

// Schema Element Viewer Component
interface SchemaElementViewProps {
  element: any;
  depth: number;
  isComplexType?: boolean;
}

function SchemaElementView({ element, depth, isComplexType = false }: SchemaElementViewProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  
  const hasChildren = element.children && element.children.length > 0;
  const hasAttributes = element.attributeDetails && element.attributeDetails.length > 0;
  const hasContent = hasChildren || hasAttributes;
  
  const getTypeDisplay = (xsdType: string) => {
    if (xsdType === 'complexType') return 'Complex';
    if (!xsdType || xsdType === 'unknown') return 'Unknown';
    return xsdType;
  };
  
  const getTypeColor = (xsdType: string) => {
    if (xsdType === 'complexType') return 'text-blue-600 dark:text-blue-400';
    if (xsdType === 'string') return 'text-green-600 dark:text-green-400';
    if (['decimal', 'integer', 'positiveInteger', 'int'].includes(xsdType)) return 'text-orange-600 dark:text-orange-400';
    if (xsdType === 'date') return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={`${depth > 0 ? 'ml-4' : ''}`}>
      <div 
        className={`p-3 rounded-lg border-l-4 ${
          isComplexType 
            ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-500' 
            : 'bg-muted border-primary'
        } ${hasContent ? 'cursor-pointer' : ''}`}
        onClick={hasContent ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasContent && (
              <div className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            )}
            <div>
              <span className="font-mono text-sm font-medium">{element.name}</span>
              {isComplexType && (
                <span className="ml-2 text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                  Type
                </span>
              )}
              {element.isReference && (
                <span className="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                  Ref
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-mono ${getTypeColor(element.xsdType)}`}>
              {getTypeDisplay(element.xsdType)}
            </span>
            {element.maxOccurs && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                {element.maxOccurs === 'unbounded' ? '∞' : `≤${element.maxOccurs}`}
              </span>
            )}
            {element.minOccurs === '0' && (
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded">
                Optional
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && hasContent && (
        <div className="mt-2 ml-6 space-y-2">
          {/* Attributes */}
          {hasAttributes && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Attributes:</p>
              {element.attributeDetails.map((attr: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <span className="font-mono text-xs">@{attr.name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-mono ${getTypeColor(attr.xsdType)}`}>
                      {getTypeDisplay(attr.xsdType)}
                    </span>
                    {attr.fixed && (
                      <span className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                        ={attr.fixed}
                      </span>
                    )}
                    {attr.use === 'required' && (
                      <span className="px-1 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Child Elements */}
          {hasChildren && (
            <div className="space-y-1">
              {element.children.map((child: any, idx: number) => (
                <SchemaElementView key={idx} element={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
              <div className="space-y-4">
                {/* Target Namespace Info */}
                {preview.targetNamespace && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Target Namespace</p>
                    <p className="font-mono text-xs text-blue-600 dark:text-blue-400">{preview.targetNamespace}</p>
                  </div>
                )}

                {/* Top-level Elements */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Elements ({(preview.elements || []).length})</h4>
                  {(preview.elements || []).map((el: any, idx: number) => (
                    <SchemaElementView key={idx} element={el} depth={0} />
                  ))}
                  {(preview.elements || []).length === 0 && (
                    <p className="text-sm text-muted-foreground">No top-level elements found.</p>
                  )}
                </div>

                {/* Complex Types */}
                {preview.complexTypes && preview.complexTypes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Complex Types ({preview.complexTypes.length})</h4>
                    {preview.complexTypes.map((ct: any, idx: number) => (
                      <SchemaElementView key={idx} element={ct} depth={0} isComplexType={true} />
                    ))}
                  </div>
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
