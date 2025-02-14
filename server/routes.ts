import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { directorySchema, type File } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

function generateTreeStructure(files: File[], parentId: number | null = null, depth = 0): string {
  const indent = "  ".repeat(depth);
  let output = "";

  const children = files.filter(f => f.parentId === parentId);
  for (const file of children) {
    output += `${indent}${file.isDirectory ? "📁" : "📄"} ${file.name}\n`;
    if (file.isDirectory) {
      output += generateTreeStructure(files, file.id, depth + 1);
    }
  }

  return output;
}

async function scanDirectory(dirPath: string, parentId: number | null = null) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const stats = await fs.stat(fullPath);

      const file = await storage.upsertFile({
        path: fullPath,
        name: entry.name,
        isDirectory: entry.isDirectory(),
        size: entry.isDirectory() ? null : stats.size,
        lastModified: stats.mtime,
        parentId
      });

      if (entry.isDirectory()) {
        await scanDirectory(fullPath, file.id);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
    throw error;
  }
}

export function registerRoutes(app: Express): Server {
  app.post("/api/directory/load", async (req, res) => {
    try {
      const { path: dirPath } = directorySchema.parse(req.body);

      // Check if directory exists and is accessible
      try {
        await fs.access(dirPath);
        const stats = await fs.stat(dirPath);
        if (!stats.isDirectory()) {
          throw new Error("Path is not a directory");
        }
      } catch (error) {
        return res.status(400).json({ 
          error: "Invalid directory path or directory not accessible" 
        });
      }

      await scanDirectory(dirPath);
      res.json({ success: true });
    } catch (error) {
      console.error("Error loading directory:", error);
      res.status(400).json({ error: String(error) });
    }
  });

  app.get("/api/files", async (req, res) => {
    const parentId = req.query.parentId ? Number(req.query.parentId) : null;
    const files = await storage.getFilesByParentId(parentId);
    res.json(files);
  });

  app.post("/api/files/export", async (req, res) => {
    try {
      const allFiles = await storage.getAllFiles();
      const treeStructure = generateTreeStructure(allFiles);
      await fs.writeFile("file_trees.txt", treeStructure);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}