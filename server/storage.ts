import { files, type File, type InsertFile } from "@shared/schema";

export interface IStorage {
  upsertFile(file: InsertFile): Promise<File>;
  getFilesByParentId(parentId: number | null): Promise<File[]>;
  deleteFile(id: number): Promise<void>;
  getFileByPath(path: string): Promise<File | undefined>;
}

export class MemStorage implements IStorage {
  private files: Map<number, File>;
  private currentId: number;

  constructor() {
    this.files = new Map();
    this.currentId = 1;
  }

  async upsertFile(insertFile: InsertFile): Promise<File> {
    const existing = Array.from(this.files.values()).find(
      f => f.path === insertFile.path
    );
    
    if (existing) {
      const updated = { ...existing, ...insertFile };
      this.files.set(existing.id, updated);
      return updated;
    }

    const id = this.currentId++;
    const file: File = { ...insertFile, id };
    this.files.set(id, file);
    return file;
  }

  async getFilesByParentId(parentId: number | null): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      file => file.parentId === parentId
    );
  }

  async deleteFile(id: number): Promise<void> {
    this.files.delete(id);
  }

  async getFileByPath(path: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(
      file => file.path === path
    );
  }
}

export const storage = new MemStorage();
