import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { directorySchema } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

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

  const httpServer = createServer(app);
  return httpServer;
}
