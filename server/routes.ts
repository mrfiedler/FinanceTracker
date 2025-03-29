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

  // API - Notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications count" });
    }
  });

  app.patch("/api/notifications/:id/mark-read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(id);

      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user!.id;
      const success = await storage.markAllNotificationsAsRead(userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

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
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Pass all date filtering options
      const expenses = await storage.getExpenses({ 
        dateRange, 
        startDate, 
        endDate 
      });

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
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Pass all date filtering options
      const revenues = await storage.getRevenues({ 
        dateRange, 
        startDate, 
        endDate 
      });

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
      // Check if we need to create a new client first
      let clientId = req.body.clientId;

      if (req.body.newClient && typeof clientId === 'string' && clientId === 'new') {
        // Create a new client as a draft
        const clientData = {
          name: req.body.newClient.name,
          email: req.body.newClient.email,
          phone: req.body.newClient.phone || null,
          businessType: req.body.newClient.businessType,
          notes: "Created as draft from Quote form",
          isActive: true
        };

        const newClient = await storage.createClient(clientData);
        clientId = newClient.id;
      }

      // Now create the quote with the client ID (either existing or newly created)
      const quoteData = {
        ...req.body,
        clientId,
        status: req.body.status || "Pending", // Use provided status or default to Pending
      };

      // Remove the newClient field before validation
      if (quoteData.newClient) {
        delete quoteData.newClient;
      }

      const data = insertQuoteSchema.parse(quoteData);
      const quote = await storage.createQuote(data);
      res.status(201).json(quote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid quote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quote", error: error instanceof Error ? error.message : String(error) });
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
      // quoteId is now handled by schema transform

      const contract = await storage.createContract(data);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      console.error("Contract creation error:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  // Update contract
  app.patch("/api/contracts/:id", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const data = insertContractSchema.parse(req.body);

      // Check if contract exists
      const existingContract = await storage.getContract(contractId);
      if (!existingContract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // quoteId is now handled by schema transform

      const updatedContract = await storage.updateContract(contractId, data);
      res.status(200).json(updatedContract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      console.error("Contract update error:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  // Delete contract
  app.delete("/api/contracts/:id", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);

      // Check if contract exists
      const existingContract = await storage.getContract(contractId);
      if (!existingContract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      await storage.deleteContract(contractId);
      res.status(204).send();
    } catch (error) {
      console.error("Contract deletion error:", error);
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // Download contract
  app.get("/api/contracts/:id/download", async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);

      // Check if contract exists
      const existingContract = await storage.getContract(contractId);
      if (!existingContract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // In a real application, you would retrieve the actual PDF file
      // For now, we'll create a simple PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${existingContract.fileName}"`);

      // This is a placeholder for a real PDF file
      // In a production app, you would fetch the actual file from storage/DB
      const pdfContent = Buffer.from(`
        %PDF-1.7
        1 0 obj
        << /Type /Catalog /Pages 2 0 R >>
        endobj
        2 0 obj
        << /Type /Pages /Kids [3 0 R] /Count 1 >>
        endobj
        3 0 obj
        << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>
        endobj
        4 0 obj
        << /Length 68 >>
        stream
        BT
        /F1 24 Tf
        100 700 Td
        (Contract: ${existingContract.title}) Tj
        ET
        endstream
        endobj
        xref
        0 5
        0000000000 65535 f
        0000000010 00000 n
        0000000059 00000 n
        0000000118 00000 n
        0000000217 00000 n
        trailer
        << /Size 5 /Root 1 0 R >>
        startxref
        335
        %%EOF
      `);

      res.send(pdfContent);
    } catch (error) {
      console.error("Contract download error:", error);
      res.status(500).json({ message: "Failed to download contract" });
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

  // API - Finance Categories
  app.get("/api/finance/categories", async (req, res) => {
    try {
      // For now, return predefined categories (in a real app, this would fetch from DB)
      const categories = [
        { id: 1, value: "groceries", label: "Groceries", type: "expense" },
        { id: 2, value: "transportation", label: "Transportation", type: "expense" },
        { id: 3, value: "utilities", label: "Utilities", type: "expense" },
        { id: 4, value: "entertainment", label: "Entertainment", type: "expense" },
        { id: 5, value: "dining", label: "Dining", type: "expense" },
        { id: 6, value: "healthcare", label: "Healthcare", type: "expense" },
        { id: 7, value: "salary", label: "Salary", type: "revenue" },
        { id: 8, value: "freelance", label: "Freelance", type: "revenue" },
        { id: 9, value: "investments", label: "Investments", type: "revenue" }
      ];
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/finance/categories", async (req, res) => {
    try {
      // In a real app, this would add to database
      // For now, simulate success response with made-up ID
      const { name, type } = req.body;

      // Validate inputs
      if (!name || !type || (type !== 'expense' && type !== 'revenue')) {
        return res.status(400).json({ message: "Invalid category data" });
      }

      const newCategory = {
        id: Math.floor(Math.random() * 1000) + 10, // Random ID (would be DB-generated)
        value: name.toLowerCase().replace(/\s+/g, ''), // Convert spaces to empty string
        label: name,
        type
      };

      res.status(200).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/finance/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, type } = req.body;

      // Validate inputs
      if (!name || !type || (type !== 'expense' && type !== 'revenue')) {
        return res.status(400).json({ message: "Invalid category data" });
      }

      // In a real app, this would update the database
      const updatedCategory = {
        id,
        value: name.toLowerCase().replace(/\s+/g, ''),
        label: name,
        type
      };

      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/finance/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // In a real app, this would delete from the database
      // For now, simulate success
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // API - Finance Accounts
  app.get("/api/finance/accounts", async (req, res) => {
    try {
      // For now, return predefined accounts (in a real app, this would fetch from DB)
      const accounts = [
        { id: 1, value: "checking", label: "Checking Account", icon: "default" },
        { id: 2, value: "savings", label: "Savings Account", icon: "default" },
        { id: 3, value: "credit", label: "Credit Card", icon: "creditcard" }
      ];
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/finance/accounts", async (req, res) => {
    try {
      // In a real app, this would add to database
      const { name, type } = req.body;

      // Validate inputs
      if (!name || !type) {
        return res.status(400).json({ message: "Invalid account data" });
      }

      const newAccount = {
        id: Math.floor(Math.random() * 1000) + 10, // Random ID (would be DB-generated)
        value: name.toLowerCase().replace(/\s+/g, ''), // Convert spaces to empty string
        label: name,
        icon: type
      };

      res.status(200).json(newAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.put("/api/finance/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, type } = req.body;

      // Validate inputs
      if (!name || !type) {
        return res.status(400).json({ message: "Invalid account data" });
      }

      // In a real app, this would update the database
      const updatedAccount = {
        id,
        value: name.toLowerCase().replace(/\s+/g, ''),
        label: name,
        icon: type
      };

      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/finance/accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // In a real app, this would delete from the database
      // For now, simulate success
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  app.get("/api/finance/transactions", async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string || "30";
      const transactionType = req.query.transactionType as string || "all";
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Create filter object based on the query parameters
      const filter: { dateRange?: string; startDate?: string; endDate?: string } = {};

      // Handle custom date ranges for monthly view
      if (dateRange === "month" && startDate && endDate) {
        filter.startDate = startDate;
        filter.endDate = endDate;
      } else {
        filter.dateRange = dateRange;
      }

      const expenses = (transactionType === "all" || transactionType === "expense") 
        ? await storage.getExpenses(filter) 
        : [];

      const revenues = (transactionType === "all" || transactionType === "revenue") 
        ? await storage.getRevenues(filter) 
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

      // Calculate totals for all transactions
      const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const totalRevenue = revenues.reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      
      // Calculate totals for only PAID transactions (for Current Balance)
      const paidExpenses = expenses
        .filter(expense => expense.isPaid)
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      const paidRevenue = revenues
        .filter(revenue => revenue.isPaid)
        .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      
      // Outstanding (unpaid) amounts
      const outstandingExpenses = totalExpenses - paidExpenses;
      const outstandingRevenue = totalRevenue - paidRevenue;

      res.json({
        transactions,
        totalExpenses,
        totalRevenue,
        paidExpenses,
        paidRevenue,
        outstandingExpenses,
        outstandingRevenue,
        // Use paid amounts for Current Balance calculation
        netProfit: paidRevenue - paidExpenses
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
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

      console.log(`Admin login attempt for username: ${username}`);

      // Find user
      const user = await storage.getUserByUsername(username);

      if (!user) {
        console.log(`No user found with username: ${username}`);
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      if (!user.isAdmin) {
        console.log(`User ${username} is not an admin`);
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      const passwordValid = await comparePasswords(password, user.password);
      if (!passwordValid) {
        console.log(`Invalid password for username: ${username}`);
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // Log in the admin user
      req.login(user, (err) => {
        if (err) {
          console.error(`Login error for ${username}:`, err);
          return res.status(500).json({ message: "Login failed" });
        }

        console.log(`Admin login successful for ${username}`);

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Admin login error:", error);
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
  app.delete("/apiadmin/users/:id", isAdmin, async (req, res) => {
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

  // Change user password (admin only)
  app.patch("/api/admin/users/:id/password", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { newPassword } = req.body;

      // Validate password
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user with new password
      const updatedUser = await storage.updateUser(id, { password: hashedPassword });

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ message: "Password updated successfully", user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // API - Company Info
  app.post("/api/company/info", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Validate the required fields
      const { name, email, phone, address, registrationNumber } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }

      // In a real app, this would save to database
      // For now, simulate success
      console.log("Company info saved:", req.body);

      res.json({ 
        success: true,
        message: "Company information saved successfully",
        data: req.body
      });
    } catch (error) {
      console.error("Error saving company info:", error);
      res.status(500).json({ message: "Failed to save company information" });
    }
  });

  // API - Profile Update
  app.patch("/api/users/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = (req.user as Express.User).id;
      const { name, email, phone, location } = req.body;

      // Update user profile
      const updatedUser = await storage.updateUser(userId, { name, email, phone, location });

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Upload company logo endpoint
  app.post("/api/company/logo", async (req, res) => {
    if (!req.isAuthenticated()) {
      console.log("Company logo upload failed: Not authenticated");
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = (req.user as Express.User).id;
      console.log(`Processing company logo upload for user ${userId}`);

      // Get the actual image URL from the request body
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "No image URL provided" });
      }

      // Store the logo URL in the user record
      await storage.updateUser(userId, {
        companyLogo: imageUrl
      });

      console.log(`Company logo saved for user ${userId}`);
      res.json({ success: true, message: "Company logo uploaded successfully" });
    } catch (error) {
      console.error("Company logo upload failed:", error);
      res.status(500).json({ message: "Failed to upload company logo" });
    }
  });

  // Global search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const query = req.query.q as string;
      
      if (!query || query.trim().length === 0) {
        return res.json({
          clients: [],
          contracts: [],
          quotes: [],
          transactions: [],
          subscriptions: []
        });
      }
      
      const lowercaseQuery = query.toLowerCase();
      
      // Search clients
      const clients = await storage.getClients();
      const matchedClients = clients.filter(client => 
        client.name.toLowerCase().includes(lowercaseQuery) || 
        (client.email && client.email.toLowerCase().includes(lowercaseQuery)) ||
        (client.phone && client.phone.toLowerCase().includes(lowercaseQuery))
      );
      
      // Search contracts
      const contracts = await storage.getContracts();
      const matchedContracts = contracts.filter(contract => 
        contract.title.toLowerCase().includes(lowercaseQuery) || 
        (contract.description && contract.description.toLowerCase().includes(lowercaseQuery)) ||
        contract.status.toLowerCase().includes(lowercaseQuery)
      );
      
      // Search quotes
      const quotes = await storage.getQuotes();
      const matchedQuotes = quotes.filter(quote => 
        quote.title.toLowerCase().includes(lowercaseQuery) || 
        (quote.description && quote.description.toLowerCase().includes(lowercaseQuery)) ||
        quote.status.toLowerCase().includes(lowercaseQuery)
      );
      
      // Search transactions
      const transactions = await storage.getTransactions();
      const matchedTransactions = transactions.filter(transaction => 
        (transaction.description && transaction.description.toLowerCase().includes(lowercaseQuery)) || 
        (transaction.category && transaction.category.toLowerCase().includes(lowercaseQuery)) ||
        transaction.type.toLowerCase().includes(lowercaseQuery)
      );

      // Search subscriptions
      const subscriptions = await storage.getSubscriptions();
      const matchedSubscriptions = subscriptions.filter(subscription => 
        (subscription.name && subscription.name.toLowerCase().includes(lowercaseQuery)) || 
        (subscription.description && subscription.description.toLowerCase().includes(lowercaseQuery)) ||
        (subscription.status && subscription.status.toLowerCase().includes(lowercaseQuery))
      );
      
      res.json({
        clients: matchedClients.slice(0, 5),
        contracts: matchedContracts.slice(0, 5),
        quotes: matchedQuotes.slice(0, 5),
        transactions: matchedTransactions.slice(0, 5),
        subscriptions: matchedSubscriptions.slice(0, 5)
      });
    } catch (error) {
      console.error("Error in global search:", error);
      res.status(500).json({ message: "Error performing search" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}