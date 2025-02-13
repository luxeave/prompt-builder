import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { directorySchema } from "@shared/schema";
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
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const stats = await fs.stat(fullPath);

    const file = await storage.upsertFile({
      path: fullPath,
      name: entry.name,
      isDirectory: entry.isDirectory(),
      size: stats.size,
      lastModified: stats.mtime,
      parentId
    });

    if (entry.isDirectory()) {
      await scanDirectory(fullPath, file.id);
    }
  }
}

export function registerRoutes(app: Express): Server {
  app.post("/api/directory/load", async (req, res) => {
    try {
      const { path: dirPath } = directorySchema.parse(req.body);
      await scanDirectory(dirPath);
      res.json({ success: true });
    } catch (error) {
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