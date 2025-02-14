import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function DirectoryPicker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadDirectory = useMutation({
    mutationFn: async (path: string) => {
      // Normalize path separators and remove any trailing slashes
      const normalizedPath = path.replace(/\\/g, '/').replace(/\/$/, '');
      await apiRequest("POST", "/api/directory/load", { path: normalizedPath });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Directory loaded",
        description: "File tree has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error loading directory",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Enter directory path..."
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const path = e.currentTarget.value.trim();
            if (path) {
              loadDirectory.mutate(path);
            }
          }
        }}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={async () => {
          try {
            const input = document.createElement("input");
            input.type = "file";
            input.webkitdirectory = true;

            // Wrap file selection in a promise
            const path = await new Promise<string>((resolve) => {
              input.onchange = () => {
                if (input.files?.[0]) {
                  // Get the directory path from the first file
                  const filePath = input.files[0].path;
                  // Get the directory path by removing the filename
                  const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
                  resolve(dirPath);
                }
              };
              input.click();
            });

            if (path) {
              loadDirectory.mutate(path);
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to select directory",
              variant: "destructive",
            });
          }
        }}
      >
        <Folder className="h-4 w-4" />
      </Button>
    </div>
  );
}