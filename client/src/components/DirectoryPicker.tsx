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
      await apiRequest("POST", "/api/directory/load", { path });
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
        title: "Error",
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
            loadDirectory.mutate(e.currentTarget.value);
          }
        }}
      />
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.webkitdirectory = true;
          input.onchange = () => {
            if (input.files?.[0]) {
              loadDirectory.mutate(input.files[0].path);
            }
          };
          input.click();
        }}
      >
        <Folder className="h-4 w-4" />
      </Button>
    </div>
  );
}
