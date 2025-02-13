import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TreeExportPanelProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function TreeExportPanel({ isEnabled, onToggle }: TreeExportPanelProps) {
  const { toast } = useToast();

  const handleChange = async (checked: boolean) => {
    try {
      if (checked) {
        await apiRequest("POST", "/api/files/export", {});
        toast({
          title: "Success",
          description: "File tree structure has been saved to file_trees.txt",
        });
      }
      onToggle(checked);
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
      onToggle(false);
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="export-tree"
          checked={isEnabled}
          onCheckedChange={handleChange}
        />
        <label
          htmlFor="export-tree"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Save to file_trees.txt
        </label>
      </div>
    </div>
  );
}
