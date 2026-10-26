import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const aiBudget = sqliteTable("ai_budget", {
 id: text("id").primaryKey(),
 used: integer("used").notNull().default(0),
 busyUntil: integer("busy_until").notNull().default(0),
});
export const records = sqliteTable("records", {
 userId: text("user_id").primaryKey(),
 payload: text("payload").notNull(),
 version: integer("version").notNull(),
 updatedAt: text("updated_at").notNull(),
});
