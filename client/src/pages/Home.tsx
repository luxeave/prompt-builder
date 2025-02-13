import { useState } from "react";
import { FileTree } from "@/components/FileTree";
import { FileDetails } from "@/components/FileDetails";
import { DirectoryPicker } from "@/components/DirectoryPicker";
import { TreeExportPanel } from "@/components/TreeExportPanel";
import { Separator } from "@/components/ui/separator";
import { type File } from "@shared/schema";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportEnabled, setExportEnabled] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4 bg-background">
        <DirectoryPicker />
      </header>

      <main className="flex-1 flex">
        <div className="w-1/4 min-w-[250px] border-r flex flex-col">
          <div className="flex-1 overflow-auto">
            <FileTree onSelect={setSelectedFile} selected={selectedFile} />
          </div>
          <TreeExportPanel isEnabled={exportEnabled} onToggle={setExportEnabled} />
        </div>

        <div className="flex-1 p-4">
          <FileDetails file={selectedFile} />
        </div>
      </main>
    </div>
  );
}