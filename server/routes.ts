import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // GET all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  // POST a new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const parsedBody = insertTransactionSchema.safeParse(req.body);
      
      if (!parsedBody.success) {
        const errorMessage = fromZodError(parsedBody.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const newTransaction = await storage.createTransaction(parsedBody.data);
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
