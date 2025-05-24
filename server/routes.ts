import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBloodPressureReadingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // For demo purposes, we'll use a hardcoded user ID
  // In a real app, this would come from authentication
  const DEMO_USER_ID = 1;

  // Ensure demo user exists
  app.use(async (req, res, next) => {
    try {
      let user = await storage.getUserByUsername("demo");
      if (!user) {
        user = await storage.createUser({ username: "demo", password: "demo" });
      }
      next();
    } catch (error) {
      next();
    }
  });

  // Get all blood pressure readings
  app.get("/api/blood-pressure", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const readings = await storage.getBloodPressureReadings(DEMO_USER_ID, limit);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching readings:", error);
      res.status(500).json({ error: "Failed to fetch blood pressure readings" });
    }
  });

  // Get latest blood pressure reading
  app.get("/api/blood-pressure/latest", async (req, res) => {
    try {
      const reading = await storage.getLatestBloodPressureReading(DEMO_USER_ID);
      if (!reading) {
        return res.status(404).json({ error: "No readings found" });
      }
      res.json(reading);
    } catch (error) {
      console.error("Error fetching latest reading:", error);
      res.status(500).json({ error: "Failed to fetch latest reading" });
    }
  });

  // Get blood pressure readings in date range
  app.get("/api/blood-pressure/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "startDate and endDate are required" });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      const readings = await storage.getBloodPressureReadingsInDateRange(DEMO_USER_ID, start, end);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching readings by date range:", error);
      res.status(500).json({ error: "Failed to fetch readings" });
    }
  });

  // Create new blood pressure reading
  app.post("/api/blood-pressure", async (req, res) => {
    try {
      const validatedData = insertBloodPressureReadingSchema.parse(req.body);
      
      // Additional validation
      if (validatedData.systolic <= validatedData.diastolic) {
        return res.status(400).json({ error: "Systolic must be higher than diastolic" });
      }

      const reading = await storage.createBloodPressureReading(DEMO_USER_ID, validatedData);
      res.status(201).json(reading);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating reading:", error);
      res.status(500).json({ error: "Failed to create blood pressure reading" });
    }
  });

  // Delete blood pressure reading
  app.delete("/api/blood-pressure/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid reading ID" });
      }

      const deleted = await storage.deleteBloodPressureReading(id, DEMO_USER_ID);
      if (!deleted) {
        return res.status(404).json({ error: "Reading not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reading:", error);
      res.status(500).json({ error: "Failed to delete reading" });
    }
  });

  // Get blood pressure statistics
  app.get("/api/blood-pressure/stats", async (req, res) => {
    try {
      const readings = await storage.getBloodPressureReadings(DEMO_USER_ID, 100);
      
      if (readings.length === 0) {
        return res.json({
          totalReadings: 0,
          averageSystolic: 0,
          averageDiastolic: 0,
          lastWeekAverage: null,
          trend: null
        });
      }

      const totalReadings = readings.length;
      const averageSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / totalReadings);
      const averageDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / totalReadings);

      // Last week readings
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const lastWeekReadings = readings.filter(r => new Date(r.recordedAt) >= oneWeekAgo);
      
      let lastWeekAverage = null;
      let trend = null;

      if (lastWeekReadings.length > 0) {
        const lastWeekSystolic = Math.round(lastWeekReadings.reduce((sum, r) => sum + r.systolic, 0) / lastWeekReadings.length);
        const lastWeekDiastolic = Math.round(lastWeekReadings.reduce((sum, r) => sum + r.diastolic, 0) / lastWeekReadings.length);
        lastWeekAverage = { systolic: lastWeekSystolic, diastolic: lastWeekDiastolic };

        // Simple trend calculation
        if (readings.length >= 2) {
          const recent = readings.slice(0, Math.floor(readings.length / 2));
          const older = readings.slice(Math.floor(readings.length / 2));
          
          const recentAvg = recent.reduce((sum, r) => sum + r.systolic, 0) / recent.length;
          const olderAvg = older.reduce((sum, r) => sum + r.systolic, 0) / older.length;
          
          const difference = recentAvg - olderAvg;
          trend = difference < -2 ? 'decreasing' : difference > 2 ? 'increasing' : 'stable';
        }
      }

      res.json({
        totalReadings,
        averageSystolic,
        averageDiastolic,
        lastWeekAverage,
        trend
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
      res.status(500).json({ error: "Failed to calculate statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
