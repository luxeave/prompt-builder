import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  name: text("name").notNull(),
  isDirectory: boolean("is_directory").notNull(),
  size: integer("size"),
  lastModified: timestamp("last_modified"),
  parentId: integer("parent_id").references(() => files.id),
});

export const insertFileSchema = createInsertSchema(files).omit({ 
  id: true 
});

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export const directorySchema = z.object({
  path: z.string(),
});
