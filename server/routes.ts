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

  // Authentication middleware
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Debug session information for troubleshooting
    console.log(`Authenticating request to ${req.method} ${req.path}`);
    console.log("Session ID:", req.sessionID);
    
    if (req.session) {
      console.log("Session data:", {
        userId: req.session.userId,
        authenticated: req.session.authenticated,
        cookie: req.session.cookie
      });
    }
    
    if (!req.session || !req.session.authenticated || !req.session.userId) {
      console.log(`Authentication failed for ${req.method} ${req.path}`);
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log(`Authentication successful for user ${req.session.userId}`);
    next();
  };

  // All API routes

  // API - Notifications
  app.get("/api/notifications", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications count" });
    }
  });

  app.patch("/api/notifications/:id/mark-read", authenticate, async (req, res) => {
    try {
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

  app.patch("/api/notifications/mark-all-read", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const success = await storage.markAllNotificationsAsRead(userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // API - Clients
  app.get("/api/clients", authenticate, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/top", authenticate, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const topClients = await storage.getTopClients(limit);
      res.json(topClients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top clients" });
    }
  });

  app.get("/api/clients/:id", authenticate, async (req, res) => {
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

  app.post("/api/clients", authenticate, async (req, res) => {
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

  app.patch("/api/clients/:id", authenticate, async (req, res) => {
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
  app.get("/api/expenses", authenticate, async (req, res) => {
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

  app.post("/api/expenses", authenticate, async (req, res) => {
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

  app.patch("/api/expenses/:id", authenticate, async (req, res) => {
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

  app.delete("/api/expenses/:id", authenticate, async (req, res) => {
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
  app.get("/api/revenues", authenticate, async (req, res) => {
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

  app.post("/api/revenues", authenticate, async (req, res) => {
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

  app.patch("/api/revenues/:id", authenticate, async (req, res) => {
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

  app.delete("/api/revenues/:id", authenticate, async (req, res) => {
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
  app.get("/api/quotes", authenticate, async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string;
      const status = req.query.status as string;
      const quotes = await storage.getQuotes({ dateRange, status });
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/recent", authenticate, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const recentQuotes = await storage.getRecentQuotes(limit);
      res.json(recentQuotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent quotes" });
    }
  });

  app.get("/api/quotes/conversion", authenticate, async (req, res) => {
    try {
      const conversionData = await storage.getQuoteConversionRate();
      res.json(conversionData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote conversion data" });
    }
  });

  app.post("/api/quotes", authenticate, async (req, res) => {
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

  app.patch("/api/quotes/:id", authenticate, async (req, res) => {
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
  app.get("/api/subscriptions", authenticate, async (req, res) => {
    try {
      const status = req.query.status as string;
      const subscriptions = await storage.getSubscriptions({ status });
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", authenticate, async (req, res) => {
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

  app.patch("/api/subscriptions/:id", authenticate, async (req, res) => {
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
  app.get("/api/contracts", authenticate, async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string;
      const contracts = await storage.getContracts({ dateRange });
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.post("/api/contracts", authenticate, async (req, res) => {
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
  app.patch("/api/contracts/:id", authenticate, async (req, res) => {
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
  app.delete("/api/contracts/:id", authenticate, async (req, res) => {
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
  app.get("/api/contracts/:id/download", authenticate, async (req, res) => {
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
  app.get("/api/finance/summary", authenticate, async (req, res) => {
    try {
      const dateRange = req.query.dateRange as string || "30";
      const summary = await storage.getFinanceSummary(dateRange);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finance summary" });
    }
  });

  app.get("/api/finance/trends", authenticate, async (req, res) => {
    try {
      const periodicity = req.query.periodicity as string || "monthly";
      const trends = await storage.getFinanceTrends(periodicity);
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch finance trends" });
    }
  });

  // API - Finance Categories
  app.get("/api/finance/categories", authenticate, async (req, res) => {
    try {
      // Get categories from storage - will be empty for new users
      const userId = req.session.userId!;
      const categories = await storage.getFinanceCategories(userId);
      
      // Map to the expected format
      const formattedCategories = categories.map(cat => ({
        id: cat.id,
        value: cat.value,
        label: cat.label,
        type: cat.type
      }));
      
      res.json(formattedCategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/finance/categories", authenticate, async (req, res) => {
    try {
      
      const { name, type } = req.body;

      // Validate inputs
      if (!name || !type || (type !== 'expense' && type !== 'revenue')) {
        return res.status(400).json({ message: "Invalid category data" });
      }
      
      // Create category in storage
      const userId = req.session.userId!;
      const value = name.toLowerCase().replace(/\s+/g, '_'); // Convert spaces to underscores
      
      const newCategory = await storage.createFinanceCategory({
        userId,
        value,
        label: name,
        type
      });

      res.status(200).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/finance/categories/:id", authenticate, async (req, res) => {
    try {
      
      const id = parseInt(req.params.id);
      const { name, type } = req.body;

      // Validate inputs
      if (!name || !type || (type !== 'expense' && type !== 'revenue')) {
        return res.status(400).json({ message: "Invalid category data" });
      }

      // Format data
      const value = name.toLowerCase().replace(/\s+/g, '_');
      
      // Update category in storage
      const updatedCategory = await storage.updateFinanceCategory(id, {
        value,
        label: name,
        type
      });

      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/finance/categories/:id", authenticate, async (req, res) => {
    try {
      
      const id = parseInt(req.params.id);
      
      // Delete category from storage
      const success = await storage.deleteFinanceCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // API - Finance Accounts
  app.get("/api/finance/accounts", authenticate, async (req, res) => {
    try {
      
      // Get accounts from storage - will be empty for new users
      const userId = req.session.userId!;
      const accounts = await storage.getFinanceAccounts(userId);
      
      // Map to the expected format
      const formattedAccounts = accounts.map(acc => ({
        id: acc.id,
        value: acc.value,
        label: acc.label,
        icon: acc.icon || 'default'
      }));
      
      res.json(formattedAccounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.post("/api/finance/accounts", authenticate, async (req, res) => {
    try {
      
      const { name, type } = req.body;

      // Validate inputs
      if (!name) {
        return res.status(400).json({ message: "Invalid account data: Name is required" });
      }

      // Create account in storage
      const userId = req.session.userId!;
      const value = name.toLowerCase().replace(/\s+/g, '_'); // Convert spaces to underscores
      
      const newAccount = await storage.createFinanceAccount({
        userId,
        value,
        label: name,
        icon: type || 'default'
      });
      
      res.status(200).json(newAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.put("/api/finance/accounts/:id", authenticate, async (req, res) => {
    try {
      
      const id = parseInt(req.params.id);
      const { name, type } = req.body;

      // Validate inputs
      if (!name) {
        return res.status(400).json({ message: "Invalid account data: Name is required" });
      }

      // Format account data
      const value = name.toLowerCase().replace(/\s+/g, '_');
      
      // Update account in storage
      const updatedAccount = await storage.updateFinanceAccount(id, {
        value,
        label: name,
        icon: type || 'default'
      });

      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/finance/accounts/:id", authenticate, async (req, res) => {
    try {
      
      const id = parseInt(req.params.id);

      // Delete account from storage
      const success = await storage.deleteFinanceAccount(id);
      
      if (!success) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  app.get("/api/finance/transactions", authenticate, async (req, res) => {
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
    if (!req.session.authenticated || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.session.user?.isAdmin) {
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

      // Store user info in session
      req.session.userId = user.id;
      req.session.authenticated = true;
      req.session.user = user;

      // Save session
      req.session.save((err) => {
        if (err) {
          console.error(`Session save error for admin ${username}:`, err);
          return res.status(500).json({ message: "Login failed" });
        }

        console.log(`Admin login successful for ${username}`);
        console.log("Session ID:", req.sessionID);

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
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      // Don't allow admin to delete themselves
      if (id === req.session.userId) {
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
  app.post("/api/company/info", authenticate, async (req, res) => {
    try {

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
  app.patch("/api/users/profile", authenticate, async (req, res) => {
    try {

      const userId = req.session.userId!;
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
  app.post("/api/company/logo", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
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

  // Upload user avatar endpoint
  app.post("/api/users/avatar", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Processing avatar upload for user ${userId}`);

      // Get the actual image URL from the request body
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "No image URL provided" });
      }

      // Store the avatar URL in the user record
      await storage.updateUser(userId, {
        avatar: imageUrl
      });

      console.log(`Avatar saved for user ${userId}`);
      res.json({ success: true, message: "Avatar uploaded successfully" });
    } catch (error) {
      console.error("Avatar upload failed:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });

  // Global search endpoint
  app.get("/api/search", authenticate, async (req, res) => {
    try {

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
      const userId = req.session.userId!;
      const transactions = await storage.getTransactions(userId, "all", {});
      const matchedTransactions = transactions.filter(transaction => 
        (transaction.description && transaction.description.toLowerCase().includes(lowercaseQuery)) || 
        (transaction.category && transaction.category.toLowerCase().includes(lowercaseQuery)) ||
        (transaction.type && transaction.type.toLowerCase().includes(lowercaseQuery))
      );

      // Search subscriptions
      const subscriptions = await storage.getSubscriptions({});
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

  // API - Achievements
  app.get("/api/achievements/stats", authenticate, async (req, res) => {
    try {
      
      // Get stats from various entities to build achievements progress
      const clients = await storage.getClients();
      const quotes = await storage.getQuotes({});
      const revenues = await storage.getRevenues({});
      const contracts = await storage.getContracts({});
      const subscriptions = await storage.getSubscriptions({});
      
      // Calculate total revenue
      const totalRevenue = revenues.reduce((sum, rev) => sum + Number(rev.amount), 0);
      
      // Calculate deals closed (quotes that were accepted)
      const closedDeals = quotes.filter(quote => quote.status === "Accepted").length;
      
      // Build the achievement stats
      const achievementStats = {
        "new-client": clients.length,
        "send-quotes": quotes.length,
        "convert-quotes": closedDeals,
        "revenue-milestone": totalRevenue,
        "subscriptions": subscriptions.length
      };
      
      res.json(achievementStats);
    } catch (error) {
      console.error("Failed to fetch achievement stats:", error);
      res.status(500).json({ message: "Failed to fetch achievement stats" });
    }
  });
  
  // Get user gamification data
  app.get("/api/user/gamification", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Fetching gamification data for user ${userId}`);
      
      // In a real implementation, this would fetch from a database
      // For now, we'll use defaults for a new user at level 1
      const gamificationData = {
        level: 1,
        points: 0,
        badges: []
      };
      
      res.json(gamificationData);
    } catch (error) {
      console.error("Failed to fetch gamification data:", error);
      res.status(500).json({ message: "Failed to fetch gamification data" });
    }
  });
  
  // Save user gamification data
  app.post("/api/user/gamification", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Saving gamification data for user ${userId}`, req.body);
      
      const data = req.body;
      
      // In a real implementation, this would save to a database
      // For now, we'll just return the data as if it was saved
      
      res.json(data);
    } catch (error) {
      console.error("Failed to save gamification data:", error);
      res.status(500).json({ message: "Failed to save gamification data" });
    }
  });

  // API - User profile
  app.patch("/api/users/profile", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Processing profile update for user ${userId}`, req.body);
      const { name, email, phone, location } = req.body;

      // Validate input
      if (name && typeof name !== 'string') {
        console.log("Invalid name format:", name);
        return res.status(400).json({ message: "Invalid name format" });
      }

      if (email && typeof email !== 'string') {
        console.log("Invalid email format:", email);
        return res.status(400).json({ message: "Invalid email format" });
      }

      if (phone && typeof phone !== 'string') {
        console.log("Invalid phone format:", phone);
        return res.status(400).json({ message: "Invalid phone format" });
      }

      if (location && typeof location !== 'string') {
        console.log("Invalid location format:", location);
        return res.status(400).json({ message: "Invalid location format" });
      }

      // Update user profile
      const updatedUser = await storage.updateUser(userId, { name, email, phone, location });

      // Update session user info
      if (req.session.user) {
        if (name) req.session.user.name = name;
        if (email) req.session.user.email = email;
        if (phone) req.session.user.phone = phone;
        if (location) req.session.user.location = location;
      }

      console.log(`Profile successfully updated for user ${userId}`);

      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // API - Upload profile avatar
  app.post("/api/users/avatar", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Processing avatar upload for user ${userId}`);

      // Get the actual image data from the request body
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "No image data provided" });
      }

      // Update user with the avatar  
      await storage.updateUser(userId, { avatar: imageUrl });

      // Update session if user data is stored there
      if (req.session.user) {
        req.session.user.avatar = imageUrl;
      }

      console.log("Avatar successfully updated for user", userId);
      res.json({ 
        success: true,
        message: "Avatar uploaded successfully",
        avatarUrl: imageUrl
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });

  // API - Company logo upload
  app.post("/api/company/logo", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Processing company logo upload for user ${userId}`);

      // Get the actual image data from the request body
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "No image data provided" });
      }

      // Update user with company logo
      await storage.updateUser(userId, { companyLogo: imageUrl });

      // Update session if user data is stored there
      if (req.session.user) {
        req.session.user.companyLogo = imageUrl;
      }

      console.log("Company logo uploaded successfully");
      res.json({ 
        success: true,
        message: "Company logo uploaded successfully",
        logoUrl: imageUrl
      });
    } catch (error) {
      console.error("Error uploading company logo:", error);
      res.status(500).json({ message: "Failed to upload company logo" });
    }
  });

  // API - Company info
  app.post("/api/company/info", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Processing company info save for user ${userId}`, req.body);

      // In a real app, this would save to a company table in the database
      // For now, we'll just simulate a successful save
      console.log("Company info saved successfully");
      res.json({ 
        success: true,
        message: "Company information saved successfully" 
      });
    } catch (error) {
      console.error("Error saving company information:", error);
      res.status(500).json({ message: "Failed to save company information" });
    }
  });

  // API - Change password
  app.patch("/api/users/password", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId!;
      console.log(`Processing password change for user ${userId}`);
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        console.log("Password change failed: Missing required fields");
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        console.log("Password change failed: Invalid password format");
        return res.status(400).json({ message: "Invalid password format" });
      }

      if (newPassword.length < 6) {
        console.log("Password change failed: New password too short");
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }

      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`Password change failed: User ${userId} not found`);
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        console.log("Password change failed: Incorrect current password");
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user with new password
      await storage.updateUser(userId, { password: hashedPassword });

      // Update session if user data is stored there
      if (req.session.user) {
        req.session.user.password = hashedPassword;
      }

      console.log(`Password successfully updated for user ${userId}`);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}