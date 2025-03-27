import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertContractSchema, insertExpenseSchema, insertQuoteSchema, insertRevenueSchema, insertSubscriptionSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, comparePasswords, hashPassword } from "./auth";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // All API routes

  // API - Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/top", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const topClients = await storage.getTopClients(limit);
      res.json(topClients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient(data);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      const data = req.body;
      const updatedClient = await storage.updateClient(id, data);
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // API - Expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string;
      const expenses = await storage.getExpenses({ dateRange });
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(data);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      const data = req.body;
      const updatedExpense = await storage.updateExpense(id, data);
      res.json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // API - Revenues
  app.get("/api/revenues", async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string;
      const revenues = await storage.getRevenues({ dateRange });
      res.json(revenues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenues" });
    }
  });

  app.post("/api/revenues", async (req, res) => {
    try {
      const data = insertRevenueSchema.parse(req.body);
      const revenue = await storage.createRevenue(data);
      res.status(201).json(revenue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid revenue data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create revenue" });
    }
  });

  app.patch("/api/revenues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const revenue = await storage.getRevenue(id);
      
      if (!revenue) {
        return res.status(404).json({ message: "Revenue not found" });
      }
      
      const data = req.body;
      const updatedRevenue = await storage.updateRevenue(id, data);
      res.json(updatedRevenue);
    } catch (error) {
      res.status(500).json({ message: "Failed to update revenue" });
    }
  });

  app.delete("/api/revenues/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRevenue(id);
      
      if (!success) {
        return res.status(404).json({ message: "Revenue not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete revenue" });
    }
  });

  // API - Quotes
  app.get("/api/quotes", async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string;
      const status = req.query.status as string;
      const quotes = await storage.getQuotes({ dateRange, status });
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const recentQuotes = await storage.getRecentQuotes(limit);
      res.json(recentQuotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent quotes" });
    }
  });

  app.get("/api/quotes/conversion", async (req, res) => {
    try {
      const conversionData = await storage.getQuoteConversionRate();
      res.json(conversionData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote conversion data" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const data = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(data);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quote = await storage.getQuote(id);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      const data = req.body;
      const updatedQuote = await storage.updateQuote(id, data);
      res.json(updatedQuote);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  // API - Subscriptions
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const status = req.query.status as string;
      const subscriptions = await storage.getSubscriptions({ status });
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const data = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(data);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscription(id);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      const data = req.body;
      const updatedSubscription = await storage.updateSubscription(id, data);
      res.json(updatedSubscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // API - Contracts
  app.get("/api/contracts", async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string;
      const contracts = await storage.getContracts({ dateRange });
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.post("/api/contracts", async (req, res) => {
    try {
      const data = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(data);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  // API - Finance summary
  app.get("/api/finance/summary", async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string || "30";
      const summary = await storage.getFinanceSummary(dateRange);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finance summary" });
    }
  });

  app.get("/api/finance/trends", async (req, res) => {
    try {
      const periodicity = req.query.periodicity as string || "monthly";
      const trends = await storage.getFinanceTrends(periodicity);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finance trends" });
    }
  });

  app.get("/api/finance/transactions", async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string || "30";
      const transactionType = req.query.transactionType as string || "all";
      
      const expenses = (transactionType === "all" || transactionType === "expense") 
        ? await storage.getExpenses({ dateRange }) 
        : [];
        
      const revenues = (transactionType === "all" || transactionType === "revenue") 
        ? await storage.getRevenues({ dateRange }) 
        : [];
      
      // Combine and format transactions
      const transactions = [
        ...expenses.map(expense => ({
          ...expense,
          type: "expense"
        })),
        ...revenues.map(revenue => ({
          ...revenue,
          type: "revenue"
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Calculate totals
      const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      
      res.json({
        transactions,
        totalExpenses,
        totalRevenue,
        netProfit: totalRevenue - totalExpenses
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Admin authentication middleware
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as Express.User;
    if (!user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    next();
  };

  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user
      const user = await storage.getUserByUsername(username);
      
      // Check if user exists and is an admin
      if (!user || !user.isAdmin || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      // Log in the admin user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Remove passwords from response
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create user (admin only)
  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // Validate input
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Don't allow admin to delete themselves
      if (id === (req.user as Express.User).id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
