import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const bloodPressureReadings = pgTable("blood_pressure_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  pulse: integer("pulse"),
  notes: text("notes"),
  tags: text("tags").array(),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBloodPressureReadingSchema = createInsertSchema(bloodPressureReadings).pick({
  systolic: true,
  diastolic: true,
  pulse: true,
  notes: true,
  tags: true,
  recordedAt: true,
}).extend({
  systolic: z.number().min(50).max(300, "Systolic value must be between 50-300 mmHg"),
  diastolic: z.number().min(30).max(200, "Diastolic value must be between 30-200 mmHg"),
  pulse: z.number().min(30).max(220).optional(),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  recordedAt: z.date().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBloodPressureReading = z.infer<typeof insertBloodPressureReadingSchema>;
export type BloodPressureReading = typeof bloodPressureReadings.$inferSelect;
