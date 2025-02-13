import { useQuery } from "@tanstack/react-query";
import { File } from "@shared/schema";
import { Tree, TreeItem } from "@/components/ui/tree";
import { Folder, File as FileIcon, ChevronRight, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileTreeProps {
  onSelect: (file: File) => void;
  selected: File | null;
}

export function FileTree({ onSelect, selected }: FileTreeProps) {
  const { data: files, isLoading } = useQuery({
    queryKey: ["/api/files"],
  });

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  const renderFile = (file: File) => {
    const isSelected = selected?.id === file.id;
    const icon = file.isDirectory ? <Folder className="h-4 w-4" /> : <FileIcon className="h-4 w-4" />;

    return (
      <TreeItem
        key={file.id}
        icon={icon}
        label={file.name}
        onClick={() => onSelect(file)}
        className={isSelected ? "bg-accent" : ""}
      />
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="p-2">
        <Tree>{files?.map(renderFile)}</Tree>
      </div>
    </ScrollArea>
  );
}
