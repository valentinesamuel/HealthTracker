import { users, bloodPressureReadings, type User, type InsertUser, type BloodPressureReading, type InsertBloodPressureReading } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Blood pressure readings
  createBloodPressureReading(userId: number, reading: InsertBloodPressureReading): Promise<BloodPressureReading>;
  getBloodPressureReadings(userId: number, limit?: number): Promise<BloodPressureReading[]>;
  getBloodPressureReading(id: number, userId: number): Promise<BloodPressureReading | undefined>;
  deleteBloodPressureReading(id: number, userId: number): Promise<boolean>;
  getBloodPressureReadingsInDateRange(userId: number, startDate: Date, endDate: Date): Promise<BloodPressureReading[]>;
  getLatestBloodPressureReading(userId: number): Promise<BloodPressureReading | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createBloodPressureReading(userId: number, reading: InsertBloodPressureReading): Promise<BloodPressureReading> {
    const [newReading] = await db
      .insert(bloodPressureReadings)
      .values({
        ...reading,
        userId,
        recordedAt: reading.recordedAt || new Date(),
      })
      .returning();
    return newReading;
  }

  async getBloodPressureReadings(userId: number, limit = 50): Promise<BloodPressureReading[]> {
    return await db
      .select()
      .from(bloodPressureReadings)
      .where(eq(bloodPressureReadings.userId, userId))
      .orderBy(desc(bloodPressureReadings.recordedAt))
      .limit(limit);
  }

  async getBloodPressureReading(id: number, userId: number): Promise<BloodPressureReading | undefined> {
    const [reading] = await db
      .select()
      .from(bloodPressureReadings)
      .where(and(
        eq(bloodPressureReadings.id, id),
        eq(bloodPressureReadings.userId, userId)
      ));
    return reading || undefined;
  }

  async deleteBloodPressureReading(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(bloodPressureReadings)
      .where(and(
        eq(bloodPressureReadings.id, id),
        eq(bloodPressureReadings.userId, userId)
      ));
    return result.rowCount > 0;
  }

  async getBloodPressureReadingsInDateRange(userId: number, startDate: Date, endDate: Date): Promise<BloodPressureReading[]> {
    return await db
      .select()
      .from(bloodPressureReadings)
      .where(and(
        eq(bloodPressureReadings.userId, userId),
        gte(bloodPressureReadings.recordedAt, startDate),
        gte(endDate, bloodPressureReadings.recordedAt)
      ))
      .orderBy(desc(bloodPressureReadings.recordedAt));
  }

  async getLatestBloodPressureReading(userId: number): Promise<BloodPressureReading | undefined> {
    const [reading] = await db
      .select()
      .from(bloodPressureReadings)
      .where(eq(bloodPressureReadings.userId, userId))
      .orderBy(desc(bloodPressureReadings.recordedAt))
      .limit(1);
    return reading || undefined;
  }
}

export const storage = new DatabaseStorage();
