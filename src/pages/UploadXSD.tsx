import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function UploadXSD() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsUploaded(false);
    }
  };

  const handleUpload = () => {
    if (file) {
      // Simulate upload
      setTimeout(() => {
        setIsUploaded(true);
        toast({
          title: "XSD Uploaded Successfully",
          description: `File "${file.name}" has been processed.`,
        });
      }, 1000);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Upload XSD File</h2>
        <p className="text-muted-foreground">Upload your XML Schema Definition file to begin the workflow</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Card */}
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>XSD File Upload</CardTitle>
            <CardDescription>Select and upload your schema definition file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                accept=".xsd"
                onChange={handleFileChange}
                className="hidden"
                id="xsd-upload"
              />
              <label htmlFor="xsd-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">XSD files only</p>
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
            <CardDescription>Parsed XSD hierarchy will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isUploaded ? (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                  <p className="font-mono text-sm font-medium">SalesPromotion</p>
                  <p className="text-xs text-muted-foreground mt-1">Root Element</p>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-secondary">
                    <p className="font-mono text-sm">Campaign</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-secondary">
                    <p className="font-mono text-sm">Products</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-secondary">
                    <p className="font-mono text-sm">Customers</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-secondary">
                    <p className="font-mono text-sm">Transactions</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Upload an XSD file to view its structure</p>
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
            <p className="text-xs text-muted-foreground">XSD (XML Schema Definition)</p>
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
