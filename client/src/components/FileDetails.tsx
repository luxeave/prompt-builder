import { File } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface FileDetailsProps {
  file: File | null;
}

export function FileDetails({ file }: FileDetailsProps) {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a file to view details
      </div>
    );
  }

  const formatSize = (size: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(2)} ${units[i]}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{file.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Type</dt>
            <dd>{file.isDirectory ? "Directory" : "File"}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Path</dt>
            <dd className="break-all">{file.path}</dd>
          </div>
          
          {!file.isDirectory && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Size</dt>
              <dd>{formatSize(file.size || 0)}</dd>
            </div>
          )}
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Last Modified</dt>
            <dd>{format(new Date(file.lastModified!), "PPP p")}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
