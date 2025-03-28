import { 
  users, type User, type InsertUser,
  clients, type Client, type InsertClient,
  expenses, type Expense, type InsertExpense,
  revenues, type Revenue, type InsertRevenue,
  quotes, type Quote, type InsertQuote,
  subscriptions, type Subscription, type InsertSubscription,
  contracts, type Contract, type InsertContract,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import { eq, desc, and, gte, count, sum, sql } from 'drizzle-orm';
import { hashPassword } from "./auth";

// Define the storage interface with all CRUD operations
export interface IStorage {
  // Session storage for authentication
  sessionStore: session.Store;

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  getTopClients(limit?: number): Promise<any[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client>;
  
  // Expenses
  getExpense(id: number): Promise<Expense | undefined>;
  getExpenses(filters?: { dateRange?: string }): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<Expense>): Promise<Expense>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Revenues
  getRevenue(id: number): Promise<Revenue | undefined>;
  getRevenues(filters?: { dateRange?: string }): Promise<Revenue[]>;
  createRevenue(revenue: InsertRevenue): Promise<Revenue>;
  updateRevenue(id: number, revenue: Partial<Revenue>): Promise<Revenue>;
  deleteRevenue(id: number): Promise<boolean>;
  
  // Quotes
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotes(filters?: { dateRange?: string, status?: string }): Promise<any[]>;
  getRecentQuotes(limit?: number): Promise<any[]>;
  getQuoteConversionRate(): Promise<any>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<Quote>): Promise<Quote>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Subscriptions
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptions(filters?: { status?: string }): Promise<any[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<Subscription>): Promise<Subscription>;
  deleteSubscription(id: number): Promise<boolean>;
  
  // Contracts
  getContract(id: number): Promise<Contract | undefined>;
  getContracts(filters?: { dateRange?: string }): Promise<any[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract>;
  deleteContract(id: number): Promise<boolean>;
  
  // Dashboard summary data
  getFinanceSummary(dateRange?: string): Promise<any>;
  getFinanceTrends(periodicity?: string): Promise<any[]>;
  
  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
}

// Implement the storage interface with in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private expenses: Map<number, Expense>;
  private revenues: Map<number, Revenue>;
  private quotes: Map<number, Quote>;
  private subscriptions: Map<number, Subscription>;
  private contracts: Map<number, Contract>;
  private notifications: Map<number, Notification>;
  
  // Session store for authentication
  sessionStore: session.Store;
  
  // ID generators
  private userId: number = 1;
  private clientId: number = 1;
  private expenseId: number = 1;
  private revenueId: number = 1;
  private quoteId: number = 1;
  private subscriptionId: number = 1;
  private contractId: number = 1;
  private notificationId: number = 1;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.expenses = new Map();
    this.revenues = new Map();
    this.quotes = new Map();
    this.subscriptions = new Map();
    this.contracts = new Map();
    this.notifications = new Map();
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initializeSampleData().catch(err => {
      console.error("Error initializing sample data:", err);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(), 
      name: insertUser.name || null,
      email: insertUser.email || null,
      isAdmin: insertUser.isAdmin || false
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClientByEmail(email: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(
      (client) => client.email === email,
    );
  }
  
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values()).map(client => {
      // Calculate total revenue for this client
      const clientRevenues = Array.from(this.revenues.values())
        .filter(revenue => revenue.clientId === client.id)
        .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      
      return {
        ...client,
        totalRevenue: clientRevenues
      };
    });
  }
  
  async getTopClients(limit: number = 5): Promise<any[]> {
    const clients = await this.getClients();
    
    return clients
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit)
      .map(client => ({
        id: client.id,
        name: client.name,
        type: client.businessType,
        revenue: client.totalRevenue
      }));
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const client: Client = {
      ...insertClient,
      id,
      isActive: true,
      createdAt: new Date(),
      lastPurchaseDate: null
    };
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientUpdate: Partial<Client>): Promise<Client> {
    const client = await this.getClient(id);
    if (!client) {
      throw new Error(`Client with id ${id} not found`);
    }
    
    const updatedClient = { ...client, ...clientUpdate };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  // Expenses
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }
  
  async getExpenses(filters?: { dateRange?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
    let expenses = Array.from(this.expenses.values());
    
    // Handle month view with specific date range
    if (filters?.startDate && filters?.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      expenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    } 
    // Handle regular date range (X days)
    else if (filters?.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      expenses = expenses.filter(expense => 
        new Date(expense.date) >= cutoffDate
      );
    }
    
    return expenses.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.expenseId++;
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }
  
  async updateExpense(id: number, expenseUpdate: Partial<Expense>): Promise<Expense> {
    const expense = await this.getExpense(id);
    if (!expense) {
      throw new Error(`Expense with id ${id} not found`);
    }
    
    const updatedExpense = { ...expense, ...expenseUpdate };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }
  
  // Revenues
  async getRevenue(id: number): Promise<Revenue | undefined> {
    return this.revenues.get(id);
  }
  
  async getRevenues(filters?: { dateRange?: string; startDate?: string; endDate?: string }): Promise<Revenue[]> {
    let revenues = Array.from(this.revenues.values());
    
    // Handle month view with specific date range
    if (filters?.startDate && filters?.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      revenues = revenues.filter(revenue => {
        const revenueDate = new Date(revenue.date);
        return revenueDate >= startDate && revenueDate <= endDate;
      });
    } 
    // Handle regular date range (X days)
    else if (filters?.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      revenues = revenues.filter(revenue => 
        new Date(revenue.date) >= cutoffDate
      );
    }
    
    return revenues.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async createRevenue(insertRevenue: InsertRevenue): Promise<Revenue> {
    const id = this.revenueId++;
    const revenue: Revenue = {
      ...insertRevenue,
      id,
      createdAt: new Date()
    };
    this.revenues.set(id, revenue);
    
    // Update client's last purchase date if needed
    const client = await this.getClient(revenue.clientId);
    if (client) {
      this.updateClient(client.id, {
        lastPurchaseDate: new Date(revenue.date)
      });
    }
    
    return revenue;
  }
  
  async updateRevenue(id: number, revenueUpdate: Partial<Revenue>): Promise<Revenue> {
    const revenue = await this.getRevenue(id);
    if (!revenue) {
      throw new Error(`Revenue with id ${id} not found`);
    }
    
    const updatedRevenue = { ...revenue, ...revenueUpdate };
    this.revenues.set(id, updatedRevenue);
    return updatedRevenue;
  }
  
  async deleteRevenue(id: number): Promise<boolean> {
    return this.revenues.delete(id);
  }
  
  // Quotes
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }
  
  async getQuotes(filters?: { dateRange?: string, status?: string }): Promise<any[]> {
    let quotes = Array.from(this.quotes.values());
    
    if (filters?.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      quotes = quotes.filter(quote => 
        new Date(quote.createdAt) >= cutoffDate
      );
    }
    
    if (filters?.status && filters.status !== "all") {
      quotes = quotes.filter(quote => quote.status === filters.status);
    }
    
    // Get full data with client details
    return Promise.all(quotes.map(async quote => {
      const client = await this.getClient(quote.clientId);
      return {
        ...quote,
        client: client || { name: "Unknown Client" }
      };
    }));
  }
  
  async getRecentQuotes(limit: number = 4): Promise<any[]> {
    const quotes = await this.getQuotes();
    
    return quotes
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  }
  
  async getQuoteConversionRate(): Promise<any> {
    const quotes = await this.getQuotes();
    
    const accepted = quotes.filter(q => q.status === "Accepted");
    const declined = quotes.filter(q => q.status === "Declined");
    const pending = quotes.filter(q => q.status === "Pending");
    
    const totalQuotes = quotes.length;
    const acceptedCount = accepted.length;
    const declinedCount = declined.length;
    const pendingCount = pending.length;
    
    const acceptedValue = accepted.reduce((sum, q) => sum + Number(q.amount), 0);
    const declinedValue = declined.reduce((sum, q) => sum + Number(q.amount), 0);
    const pendingValue = pending.reduce((sum, q) => sum + Number(q.amount), 0);
    
    const conversionRate = totalQuotes ? Math.round((acceptedCount / totalQuotes) * 100) : 0;
    
    return {
      conversionRate,
      accepted: {
        count: acceptedCount,
        value: acceptedValue
      },
      declined: {
        count: declinedCount,
        value: declinedValue
      },
      pending: {
        count: pendingCount,
        value: pendingValue
      },
      total: {
        count: totalQuotes,
        value: acceptedValue + declinedValue + pendingValue
      }
    };
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = this.quoteId++;
    const quote: Quote = {
      ...insertQuote,
      id,
      status: "Pending",
      createdAt: new Date()
    };
    this.quotes.set(id, quote);
    return quote;
  }
  
  async updateQuote(id: number, quoteUpdate: Partial<Quote>): Promise<Quote> {
    const quote = await this.getQuote(id);
    if (!quote) {
      throw new Error(`Quote with id ${id} not found`);
    }
    
    const updatedQuote = { ...quote, ...quoteUpdate };
    this.quotes.set(id, updatedQuote);
    return updatedQuote;
  }
  
  async deleteQuote(id: number): Promise<boolean> {
    return this.quotes.delete(id);
  }
  
  // Subscriptions
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async getSubscriptions(filters?: { status?: string }): Promise<any[]> {
    let subscriptions = Array.from(this.subscriptions.values());
    
    if (filters?.status === "active") {
      subscriptions = subscriptions.filter(sub => sub.isActive);
    } else if (filters?.status === "inactive") {
      subscriptions = subscriptions.filter(sub => !sub.isActive);
    }
    
    // Get full data with client details
    return Promise.all(subscriptions.map(async sub => {
      const client = await this.getClient(sub.clientId);
      return {
        ...sub,
        client: client || { name: "Unknown Client" }
      };
    }));
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      createdAt: new Date()
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, subscriptionUpdate: Partial<Subscription>): Promise<Subscription> {
    const subscription = await this.getSubscription(id);
    if (!subscription) {
      throw new Error(`Subscription with id ${id} not found`);
    }
    
    const updatedSubscription = { ...subscription, ...subscriptionUpdate };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async deleteSubscription(id: number): Promise<boolean> {
    return this.subscriptions.delete(id);
  }
  
  // Contracts
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }
  
  async getContracts(filters?: { dateRange?: string }): Promise<any[]> {
    let contracts = Array.from(this.contracts.values());
    
    if (filters?.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      contracts = contracts.filter(contract => 
        new Date(contract.createdAt) >= cutoffDate
      );
    }
    
    // Get full data with quote and client details
    return Promise.all(contracts.map(async contract => {
      const quote = await this.getQuote(contract.quoteId);
      let client = null;
      
      if (quote) {
        client = await this.getClient(quote.clientId);
      }
      
      return {
        ...contract,
        quote: quote ? {
          ...quote,
          client: client || { name: "Unknown Client" }
        } : { jobTitle: "Unknown Quote" }
      };
    }));
  }
  
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.contractId++;
    // In a real implementation, the file would be handled differently
    const contract: Contract = {
      id,
      title: insertContract.title,
      quoteId: insertContract.quoteId ? Number(insertContract.quoteId) : null,
      fileName: "contract.pdf", // This would be the real filename
      fileUrl: `/contracts/${id}`, // This would be the real file URL
      description: insertContract.description || null,
      createdAt: new Date()
    };
    this.contracts.set(id, contract);
    return contract;
  }
  
  async updateContract(id: number, contractUpdate: Partial<InsertContract>): Promise<Contract> {
    const contract = await this.getContract(id);
    if (!contract) {
      throw new Error(`Contract with id ${id} not found`);
    }
    
    const updatedContract = { 
      ...contract,
      ...contractUpdate,
      quoteId: contractUpdate.quoteId ? Number(contractUpdate.quoteId) : null
    };
    
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }
  
  async deleteContract(id: number): Promise<boolean> {
    return this.contracts.delete(id);
  }
  
  // Dashboard summary data
  async getFinanceSummary(dateRange: string = "30"): Promise<any> {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Previous period for comparison
    const prevCutoffDate = new Date(cutoffDate);
    prevCutoffDate.setDate(prevCutoffDate.getDate() - days);
    
    // Current period data
    const currentExpenses = (await this.getExpenses({ dateRange }))
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const currentRevenues = (await this.getRevenues({ dateRange }))
      .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    // Previous period data
    const prevExpenses = Array.from(this.expenses.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= prevCutoffDate && expenseDate < cutoffDate;
      })
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const prevRevenues = Array.from(this.revenues.values())
      .filter(revenue => {
        const revenueDate = new Date(revenue.date);
        return revenueDate >= prevCutoffDate && revenueDate < cutoffDate;
      })
      .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    // Calculate change percentages
    const expensesChange = prevExpenses ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;
    const revenueChange = prevRevenues ? ((currentRevenues - prevRevenues) / prevRevenues) * 100 : 0;
    const currentProfit = currentRevenues - currentExpenses;
    const prevProfit = prevRevenues - prevExpenses;
    const profitChange = prevProfit ? ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0;
    
    // Get clients with outstanding payments
    const clients = await this.getClients();
    const clientsWithPendingPayments = clients.filter(client => {
      const pendingQuotes = Array.from(this.quotes.values())
        .filter(quote => quote.clientId === client.id && quote.status === "Accepted");
      
      return pendingQuotes.length > 0;
    });
    
    const outstandingPayments = Array.from(this.quotes.values())
      .filter(quote => quote.status === "Accepted")
      .reduce((sum, quote) => sum + Number(quote.amount), 0);
    
    return {
      totalRevenue: currentRevenues,
      totalExpenses: currentExpenses,
      netProfit: currentProfit,
      outstandingPayments,
      revenueChange,
      expensesChange,
      profitChange,
      pendingClients: clientsWithPendingPayments.length
    };
  }
  
  async getFinanceTrends(periodicity: string = "monthly"): Promise<any[]> {
    const now = new Date();
    const result = [];
    
    let periods = 12; // Default for monthly
    if (periodicity === "weekly") periods = 8;
    if (periodicity === "daily") periods = 14;
    
    for (let i = periods - 1; i >= 0; i--) {
      let startDate, endDate, name;
      
      if (periodicity === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        name = startDate.toLocaleString('default', { month: 'short' });
      } else if (periodicity === "weekly") {
        startDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);
        name = `W${Math.ceil(startDate.getDate() / 7)}`;
      } else {
        startDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000) - 1);
        name = startDate.getDate().toString();
      }
      
      // Filter expenses and revenues for this period
      const periodExpenses = Array.from(this.expenses.values())
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startDate && expenseDate <= endDate;
        })
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      const periodRevenues = Array.from(this.revenues.values())
        .filter(revenue => {
          const revenueDate = new Date(revenue.date);
          return revenueDate >= startDate && revenueDate <= endDate;
        })
        .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      
      result.push({
        name,
        expenses: periodExpenses,
        revenue: periodRevenues
      });
    }
    
    return result;
  }
  
  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) {
      return false;
    }
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
    
    if (userNotifications.length === 0) {
      return false;
    }
    
    userNotifications.forEach(notification => {
      notification.isRead = true;
      this.notifications.set(notification.id, notification);
    });
    
    return true;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  // Dashboard summary data
  async getFinanceSummary(dateRange: string = "30"): Promise<any> {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Previous period for comparison
    const prevCutoffDate = new Date(cutoffDate);
    prevCutoffDate.setDate(prevCutoffDate.getDate() - days);
    
    // Current period data
    const currentExpenses = (await this.getExpenses({ dateRange }))
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const currentRevenues = (await this.getRevenues({ dateRange }))
      .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    // Previous period data
    const prevExpenses = Array.from(this.expenses.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= prevCutoffDate && expenseDate < cutoffDate;
      })
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    
    const prevRevenues = Array.from(this.revenues.values())
      .filter(revenue => {
        const revenueDate = new Date(revenue.date);
        return revenueDate >= prevCutoffDate && revenueDate < cutoffDate;
      })
      .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
    
    // Calculate change percentages
    const expensesChange = prevExpenses ? ((currentExpenses - prevExpenses) / prevExpenses) * 100 : 0;
    const revenueChange = prevRevenues ? ((currentRevenues - prevRevenues) / prevRevenues) * 100 : 0;
    const currentProfit = currentRevenues - currentExpenses;
    const prevProfit = prevRevenues - prevExpenses;
    const profitChange = prevProfit ? ((currentProfit - prevProfit) / Math.abs(prevProfit)) * 100 : 0;
    
    // Get clients with outstanding payments
    const clients = await this.getClients();
    const clientsWithPendingPayments = clients.filter(client => {
      const pendingQuotes = Array.from(this.quotes.values())
        .filter(quote => quote.clientId === client.id && quote.status === "Accepted");
      
      return pendingQuotes.length > 0;
    });
    
    const outstandingPayments = Array.from(this.quotes.values())
      .filter(quote => quote.status === "Accepted")
      .reduce((sum, quote) => sum + Number(quote.amount), 0);
    
    return {
      totalRevenue: currentRevenues,
      totalExpenses: currentExpenses,
      netProfit: currentProfit,
      outstandingPayments,
      revenueChange,
      expensesChange,
      profitChange,
      pendingClients: clientsWithPendingPayments.length
    };
  }
  
  async getFinanceTrends(periodicity: string = "monthly"): Promise<any[]> {
    const now = new Date();
    const result = [];
    
    let periods = 12; // Default for monthly
    if (periodicity === "weekly") periods = 8;
    if (periodicity === "daily") periods = 14;
    
    for (let i = periods - 1; i >= 0; i--) {
      let startDate, endDate, name;
      
      if (periodicity === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        name = startDate.toLocaleString('default', { month: 'short' });
      } else if (periodicity === "weekly") {
        startDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);
        name = `W${Math.ceil(startDate.getDate() / 7)}`;
      } else {
        startDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000) - 1);
        name = startDate.getDate().toString();
      }
      
      // Filter expenses and revenues for this period
      const periodExpenses = Array.from(this.expenses.values())
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startDate && expenseDate <= endDate;
        })
        .reduce((sum, expense) => sum + Number(expense.amount), 0);
      
      const periodRevenues = Array.from(this.revenues.values())
        .filter(revenue => {
          const revenueDate = new Date(revenue.date);
          return revenueDate >= startDate && revenueDate <= endDate;
        })
        .reduce((sum, revenue) => sum + Number(revenue.amount), 0);
      
      result.push({
        name,
        expenses: periodExpenses,
        revenue: periodRevenues
      });
    }
    
    return result;
  }
  
  // Helper function to seed initial data
  private async initializeSampleData() {
    // Create admin user
    const hashedPassword = await hashPassword('tryout2025');
    
    this.createUser({
      username: 'admintesto',
      password: hashedPassword,
      name: 'Admin User',
      email: 'admin@example.com',
      isAdmin: true
    });
    
    // Sample clients
    const client1 = this.createClient({
      name: "Nova Design",
      email: "contact@novadesign.com",
      phone: "+1 (555) 123-4567",
      businessType: "Design Studio",
      notes: "Premier design studio specializing in branding and UI/UX"
    });
    
    const client2 = this.createClient({
      name: "Echo Creative",
      email: "info@echocreative.com",
      phone: "+1 (555) 987-6543",
      businessType: "Marketing Agency",
      notes: "Full-service marketing agency with focus on digital campaigns"
    });
    
    const client3 = this.createClient({
      name: "Terra Tech",
      email: "hello@terratech.io",
      phone: "+1 (555) 456-7890",
      businessType: "Software House",
      notes: "Software development company specializing in mobile apps"
    });
    
    const client4 = this.createClient({
      name: "Spark Media",
      email: "contact@sparkmedia.co",
      phone: "+1 (555) 234-5678",
      businessType: "Media Company",
      notes: "Media production company for video and audio content"
    });
    
    const client5 = this.createClient({
      name: "Arch Build",
      email: "info@archbuild.com",
      phone: "+1 (555) 876-5432",
      businessType: "Architecture Firm",
      notes: "Modern architecture firm focused on sustainable design"
    });

    // Sample expenses over the last 90 days
    const expenseCategories = ["rent", "salaries", "software", "hardware", "marketing", "office", "travel"];
    const today = new Date();

    // Add two specific recent expenses
    this.createExpense({
      description: "New Design Software Licenses",
      amount: "1200.00",
      category: "software",
      date: new Date().toISOString().split('T')[0],
      notes: "Annual Adobe Creative Cloud Licenses",
      currency: "USD",
      account: "stripe"
    });

    this.createExpense({
      description: "Office Equipment",
      amount: "800.00",
      category: "hardware",
      date: new Date().toISOString().split('T')[0],
      notes: "New monitors for design team",
      currency: "USD",
      account: "chase"
    });
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      
      const accounts = ["default", "chase", "bankofamerica", "wells_fargo", "paypal", "stripe", "square", "venmo", "cash", "other"];
      this.createExpense({
        description: `Expense ${i + 1}`,
        amount: (Math.random() * 1000 + 100).toFixed(2),
        category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
        date: date.toISOString().split('T')[0],
        notes: `Sample expense ${i + 1}`,
        currency: ["USD", "EUR", "BRL"][Math.floor(Math.random() * 3)],
        account: accounts[Math.floor(Math.random() * accounts.length)]
      });
    }
    
    // Sample revenues over the last 90 days
    const revenueCategories = ["design", "development", "marketing", "consulting", "maintenance"];
    const clientIds = [1, 2, 3, 4, 5];

    // Add two specific recent revenues with due dates
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    this.createRevenue({
      description: "Website Redesign Project",
      amount: "4500.00",
      clientId: 1,
      category: "design",
      date: new Date().toISOString().split('T')[0],
      dueDate: lastWeek.toISOString().split('T')[0],
      notes: "Complete website overhaul for Nova Design",
      currency: "USD",
      isPaid: false,
      account: "stripe"
    });

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    this.createRevenue({
      description: "Marketing Campaign",
      amount: "3200.00",
      clientId: 2,
      category: "marketing",
      date: new Date().toISOString().split('T')[0],
      dueDate: twoWeeksAgo.toISOString().split('T')[0],
      notes: "Q2 Digital Marketing Campaign",
      currency: "USD",
      isPaid: false,
      account: "paypal"
    });
    
    for (let i = 0; i < 25; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      
      const accounts = ["default", "chase", "bankofamerica", "wells_fargo", "paypal", "stripe", "square", "venmo", "cash", "other"];
      this.createRevenue({
        description: `Revenue ${i + 1}`,
        amount: (Math.random() * 2000 + 500).toFixed(2),
        clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
        category: revenueCategories[Math.floor(Math.random() * revenueCategories.length)],
        date: date.toISOString().split('T')[0],
        notes: `Sample revenue ${i + 1}`,
        currency: ["USD", "EUR", "BRL"][Math.floor(Math.random() * 3)],
        account: accounts[Math.floor(Math.random() * accounts.length)]
      });
    }
    
    // Sample quotes
    const quoteStatuses = ["Pending", "Accepted", "Declined"];
    const jobTitles = [
      "Website Redesign", 
      "Social Media Campaign", 
      "Mobile App Development", 
      "Content Marketing", 
      "Brand Identity Design"
    ];
    
    for (let i = 0; i < 20; i++) {
      const createdDate = new Date(today);
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60));
      
      const validUntilDate = new Date(createdDate);
      validUntilDate.setDate(validUntilDate.getDate() + 30);
      
      const quote: any = {
        jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
        jobDescription: `Detailed description for ${jobTitles[Math.floor(Math.random() * jobTitles.length)]}`,
        amount: (Math.random() * 5000 + 1000).toFixed(2),
        clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
        status: quoteStatuses[Math.floor(Math.random() * quoteStatuses.length)],
        currency: ["USD", "EUR", "BRL"][Math.floor(Math.random() * 3)],
        validUntil: validUntilDate.toISOString().split('T')[0],
        notes: `Terms and conditions for quote ${i + 1}`
      };
      
      // Create the quote with raw values first
      const newQuote = {
        ...quote,
        id: this.quoteId++,
        createdAt: createdDate
      };
      
      this.quotes.set(newQuote.id, newQuote);
    }
    
    // Sample subscriptions
    const frequencies = ["monthly", "quarterly", "biannually", "annually"];
    const subscriptionNames = [
      "Website Maintenance", 
      "SEO Services", 
      "Social Media Management", 
      "Cloud Hosting", 
      "Content Creation"
    ];
    
    for (let i = 0; i < 8; i++) {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 180));
      
      let endDate = null;
      if (Math.random() > 0.5) {
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        endDate = endDate.toISOString().split('T')[0];
      }
      
      this.createSubscription({
        name: subscriptionNames[Math.floor(Math.random() * subscriptionNames.length)],
        amount: (Math.random() * 500 + 100).toFixed(2),
        clientId: clientIds[Math.floor(Math.random() * clientIds.length)],
        frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
        startDate: startDate.toISOString().split('T')[0],
        endDate,
        isActive: Math.random() > 0.2, // 80% are active
        currency: ["USD", "EUR", "BRL"][Math.floor(Math.random() * 3)],
        description: `Subscription service for ${i + 1}`
      });
    }
    
    // Sample contracts
    const contractTitles = [
      "Service Agreement", 
      "Consulting Contract", 
      "Development Agreement", 
      "Marketing Services", 
      "Maintenance Contract"
    ];
    
    const quoteIds = Array.from(this.quotes.values())
      .filter(quote => quote.status === "Accepted")
      .map(quote => quote.id);
    
    for (let i = 0; i < Math.min(5, quoteIds.length); i++) {
      const createdDate = new Date(today);
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
      
      const contract: Contract = {
        id: this.contractId++,
        title: contractTitles[Math.floor(Math.random() * contractTitles.length)],
        quoteId: quoteIds[i],
        fileName: `contract_${i + 1}.pdf`,
        fileUrl: `/contracts/${i + 1}`,
        description: `Contract for approved quote #${quoteIds[i]}`,
        createdAt: createdDate
      };
      
      this.contracts.set(contract.id, contract);
    }
  }
}

// Database storage implementation using drizzle
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }
  
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result[0]?.count || 0;
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    
    return result[0];
  }
  
  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    const result = await db
      .delete(notifications)
      .where(eq(notifications.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    try {
      const result = await db
        .update(users)
        .set(userData)
        .where(eq(users.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`User with id ${id} not found`);
      }
      
      return result[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }
  
  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }
  
  async getClientByEmail(email: string): Promise<Client | undefined> {
    const result = await db.select().from(clients).where(eq(clients.email, email));
    return result[0];
  }
  
  async getClients(): Promise<Client[]> {
    const clientsResult = await db.select().from(clients);
    
    // For each client, calculate total revenue
    const clientsWithRevenue = await Promise.all(clientsResult.map(async (client) => {
      const clientRevenues = await db
        .select({ total: sum(revenues.amount) })
        .from(revenues)
        .where(eq(revenues.clientId, client.id));
      
      const totalRevenue = clientRevenues[0]?.total || 0;
      
      return {
        ...client,
        totalRevenue
      };
    }));
    
    return clientsWithRevenue;
  }
  
  async getTopClients(limit: number = 5): Promise<any[]> {
    const clients = await this.getClients();
    
    return clients
      .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
      .slice(0, limit)
      .map(client => ({
        id: client.id,
        name: client.name,
        type: client.businessType,
        revenue: client.totalRevenue
      }));
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const result = await db.insert(clients).values(insertClient).returning();
    return result[0];
  }
  
  async updateClient(id: number, clientUpdate: Partial<Client>): Promise<Client> {
    const result = await db
      .update(clients)
      .set(clientUpdate)
      .where(eq(clients.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Client with id ${id} not found`);
    }
    
    return result[0];
  }
  
  // Expenses
  async getExpense(id: number): Promise<Expense | undefined> {
    const result = await db.select().from(expenses).where(eq(expenses.id, id));
    return result[0];
  }
  
  async getExpenses(filters?: { dateRange?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
    let query = db.select().from(expenses);
    
    // Handle month view with specific date range
    if (filters?.startDate && filters?.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      query = query.where(
        and(
          gte(expenses.date, startDate.toISOString().split('T')[0]),
          sql`date(${expenses.date}) <= ${endDate.toISOString().split('T')[0]}`
        )
      );
    } 
    // Handle regular date range (X days)
    else if (filters?.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      query = query.where(gte(expenses.date, cutoffDate));
    }
    
    const result = await query.orderBy(desc(expenses.date));
    return result;
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const result = await db.insert(expenses).values(insertExpense).returning();
    return result[0];
  }
  
  async updateExpense(id: number, expenseUpdate: Partial<Expense>): Promise<Expense> {
    const result = await db
      .update(expenses)
      .set(expenseUpdate)
      .where(eq(expenses.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Expense with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning({ id: expenses.id });
    
    return result.length > 0;
  }
  
  // Revenues
  async getRevenue(id: number): Promise<Revenue | undefined> {
    const result = await db.select().from(revenues).where(eq(revenues.id, id));
    return result[0];
  }
  
  async getRevenues(filters?: { dateRange?: string; startDate?: string; endDate?: string }): Promise<Revenue[]> {
    let query = db.select().from(revenues);
    
    // Handle month view with specific date range
    if (filters?.startDate && filters?.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      query = query.where(
        and(
          gte(revenues.date, startDate.toISOString().split('T')[0]),
          sql`date(${revenues.date}) <= ${endDate.toISOString().split('T')[0]}`
        )
      );
    } 
    // Handle regular date range (X days)
    else if (filters?.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      query = query.where(gte(revenues.date, cutoffDate));
    }
    
    const result = await query.orderBy(desc(revenues.date));
    return result;
  }
  
  async createRevenue(insertRevenue: InsertRevenue): Promise<Revenue> {
    const result = await db.insert(revenues).values(insertRevenue).returning();
    
    // Update client's last purchase date
    if (result[0]) {
      await db
        .update(clients)
        .set({ lastPurchaseDate: result[0].date })
        .where(eq(clients.id, result[0].clientId));
    }
    
    return result[0];
  }
  
  async updateRevenue(id: number, revenueUpdate: Partial<Revenue>): Promise<Revenue> {
    const result = await db
      .update(revenues)
      .set(revenueUpdate)
      .where(eq(revenues.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Revenue with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteRevenue(id: number): Promise<boolean> {
    const result = await db
      .delete(revenues)
      .where(eq(revenues.id, id))
      .returning({ id: revenues.id });
    
    return result.length > 0;
  }
  
  // Quotes
  async getQuote(id: number | null): Promise<Quote | undefined> {
    if (id === null) return undefined;
    const result = await db.select().from(quotes).where(eq(quotes.id, id));
    return result[0];
  }
  
  async getQuotes(filters?: { dateRange?: string, status?: string }): Promise<any[]> {
    let query = db.select().from(quotes);
    
    if (filters?.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      query = query.where(gte(quotes.createdAt, cutoffDate));
    }
    
    if (filters?.status && filters.status !== "all") {
      query = query.where(eq(quotes.status, filters.status));
    }
    
    const result = await query;
    
    // Get full data with client details
    return Promise.all(result.map(async quote => {
      const client = await this.getClient(quote.clientId);
      return {
        ...quote,
        client: client || { name: "Unknown Client" }
      };
    }));
  }
  
  async getRecentQuotes(limit: number = 4): Promise<any[]> {
    const result = await db
      .select()
      .from(quotes)
      .orderBy(desc(quotes.createdAt))
      .limit(limit);
    
    // Get full data with client details
    return Promise.all(result.map(async quote => {
      const client = await this.getClient(quote.clientId);
      return {
        ...quote,
        client: client || { name: "Unknown Client" }
      };
    }));
  }
  
  async getQuoteConversionRate(): Promise<any> {
    const allQuotes = await db.select().from(quotes);
    
    const accepted = allQuotes.filter(q => q.status === "Accepted");
    const declined = allQuotes.filter(q => q.status === "Declined");
    const pending = allQuotes.filter(q => q.status === "Pending");
    
    const totalQuotes = allQuotes.length;
    const acceptedCount = accepted.length;
    const declinedCount = declined.length;
    const pendingCount = pending.length;
    
    const acceptedValue = accepted.reduce((sum, q) => sum + Number(q.amount), 0);
    const declinedValue = declined.reduce((sum, q) => sum + Number(q.amount), 0);
    const pendingValue = pending.reduce((sum, q) => sum + Number(q.amount), 0);
    
    const conversionRate = totalQuotes ? Math.round((acceptedCount / totalQuotes) * 100) : 0;
    
    return {
      conversionRate,
      accepted: {
        count: acceptedCount,
        value: acceptedValue
      },
      declined: {
        count: declinedCount,
        value: declinedValue
      },
      pending: {
        count: pendingCount,
        value: pendingValue
      },
      total: {
        count: totalQuotes,
        value: acceptedValue + declinedValue + pendingValue
      }
    };
  }
  
  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const result = await db
      .insert(quotes)
      .values({
        ...insertQuote,
        status: "Pending"
      })
      .returning();
    
    return result[0];
  }
  
  async updateQuote(id: number, quoteUpdate: Partial<Quote>): Promise<Quote> {
    const result = await db
      .update(quotes)
      .set(quoteUpdate)
      .where(eq(quotes.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Quote with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteQuote(id: number): Promise<boolean> {
    const result = await db
      .delete(quotes)
      .where(eq(quotes.id, id))
      .returning({ id: quotes.id });
    
    return result.length > 0;
  }
  
  // Subscriptions
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return result[0];
  }
  
  async getSubscriptions(filters?: { status?: string }): Promise<any[]> {
    let query = db.select().from(subscriptions);
    
    if (filters?.status === "active") {
      query = query.where(eq(subscriptions.isActive, true));
    } else if (filters?.status === "inactive") {
      query = query.where(eq(subscriptions.isActive, false));
    }
    
    const result = await query;
    
    // Get full data with client details
    return Promise.all(result.map(async sub => {
      const client = await this.getClient(sub.clientId);
      return {
        ...sub,
        client: client || { name: "Unknown Client" }
      };
    }));
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const result = await db.insert(subscriptions).values(insertSubscription).returning();
    return result[0];
  }
  
  async updateSubscription(id: number, subscriptionUpdate: Partial<Subscription>): Promise<Subscription> {
    const result = await db
      .update(subscriptions)
      .set(subscriptionUpdate)
      .where(eq(subscriptions.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Subscription with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteSubscription(id: number): Promise<boolean> {
    const result = await db
      .delete(subscriptions)
      .where(eq(subscriptions.id, id))
      .returning({ id: subscriptions.id });
    
    return result.length > 0;
  }
  
  // Contracts
  async getContract(id: number): Promise<Contract | undefined> {
    const result = await db.select().from(contracts).where(eq(contracts.id, id));
    return result[0];
  }
  
  async getContracts(filters?: { dateRange?: string }): Promise<any[]> {
    let query = db.select().from(contracts);
    
    if (filters?.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      query = query.where(gte(contracts.createdAt, cutoffDate));
    }
    
    const result = await query;
    
    // Get full data with quote and client details
    return Promise.all(result.map(async contract => {
      const quote = await this.getQuote(contract.quoteId);
      let client = null;
      
      if (quote) {
        client = await this.getClient(quote.clientId);
      }
      
      return {
        ...contract,
        quote: quote ? {
          ...quote,
          client: client || { name: "Unknown Client" }
        } : { jobTitle: "Unknown Quote" }
      };
    }));
  }
  
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const contractData = {
      title: insertContract.title,
      quoteId: insertContract.quoteId ? Number(insertContract.quoteId) : null,
      fileName: "contract.pdf", // This would be handled by a file upload service
      fileUrl: `/contracts/${Date.now()}`, // This would be a real file URL
      description: insertContract.description || null
    };
    
    const result = await db.insert(contracts).values(contractData).returning();
    return result[0];
  }
  
  async updateContract(id: number, contractUpdate: Partial<InsertContract>): Promise<Contract> {
    // First check if contract exists
    const existingContract = await this.getContract(id);
    if (!existingContract) {
      throw new Error(`Contract with id ${id} not found`);
    }
    
    // Prepare the update data
    const updateData = {
      ...contractUpdate,
      quoteId: contractUpdate.quoteId ? Number(contractUpdate.quoteId) : null
    };
    
    // Update the contract
    const result = await db
      .update(contracts)
      .set(updateData)
      .where(eq(contracts.id, id))
      .returning();
    
    return result[0];
  }
  
  async deleteContract(id: number): Promise<boolean> {
    const result = await db
      .delete(contracts)
      .where(eq(contracts.id, id))
      .returning({ id: contracts.id });
    
    return result.length > 0;
  }
  
  // Dashboard summary data
  async getFinanceSummary(dateRange: string = "30"): Promise<any> {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Previous period for comparison
    const prevCutoffDate = new Date(cutoffDate);
    prevCutoffDate.setDate(prevCutoffDate.getDate() - days);
    
    // Current period data
    const currentExpenses = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(gte(expenses.date, cutoffDate));
      
    const currentRevenues = await db
      .select({ total: sum(revenues.amount) })
      .from(revenues)
      .where(gte(revenues.date, cutoffDate));
    
    // Previous period data for comparison
    const previousExpenses = await db
      .select({ total: sum(expenses.amount) })
      .from(expenses)
      .where(
        and(
          gte(expenses.date, prevCutoffDate),
          sql`${expenses.date} < ${cutoffDate}`
        )
      );
      
    const previousRevenues = await db
      .select({ total: sum(revenues.amount) })
      .from(revenues)
      .where(
        and(
          gte(revenues.date, prevCutoffDate),
          sql`${revenues.date} < ${cutoffDate}`
        )
      );
    
    // Get pending payments
    const pendingRevenues = await db
      .select({ total: sum(revenues.amount) })
      .from(revenues)
      .where(
        and(
          eq(revenues.isPaid, false),
          gte(revenues.date, cutoffDate)
        )
      );
    
    // Get pending clients count (clients with unpaid revenues)
    const pendingClients = await db
      .select({
        clientId: revenues.clientId,
        count: count()
      })
      .from(revenues)
      .where(
        and(
          eq(revenues.isPaid, false),
          gte(revenues.date, cutoffDate)
        )
      )
      .groupBy(revenues.clientId);
    
    const totalExpenses = currentExpenses[0]?.total || 0;
    const totalRevenues = currentRevenues[0]?.total || 0;
    const prevExpenses = previousExpenses[0]?.total || 0;
    const prevRevenues = previousRevenues[0]?.total || 0;
    
    const netProfit = Number(totalRevenues) - Number(totalExpenses);
    const prevNetProfit = Number(prevRevenues) - Number(prevExpenses);
    
    // Calculate percentage changes
    const expensesChange = prevExpenses ? ((Number(totalExpenses) - Number(prevExpenses)) / Number(prevExpenses)) * 100 : 0;
    const revenueChange = prevRevenues ? ((Number(totalRevenues) - Number(prevRevenues)) / Number(prevRevenues)) * 100 : 0;
    const profitChange = prevNetProfit ? ((netProfit - prevNetProfit) / prevNetProfit) * 100 : 0;
    
    return {
      totalRevenue: Number(totalRevenues),
      totalExpenses: Number(totalExpenses),
      netProfit,
      revenueChange,
      expensesChange,
      profitChange,
      outstandingPayments: Number(pendingRevenues[0]?.total || 0),
      pendingClients: pendingClients.length
    };
  }
  
  async getFinanceTrends(periodicity: string = "monthly"): Promise<any[]> {
    // Implementation would depend on the required data format
    // This is a simplified version
    const currentYear = new Date().getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const result = [];
    
    for (let i = 0; i < months.length; i++) {
      const startDate = new Date(currentYear, i, 1);
      const endDate = new Date(currentYear, i + 1, 0);
      
      const monthExpenses = await db
        .select({ total: sum(expenses.amount) })
        .from(expenses)
        .where(
          and(
            gte(expenses.date, startDate),
            sql`${expenses.date} <= ${endDate}`
          )
        );
        
      const monthRevenues = await db
        .select({ total: sum(revenues.amount) })
        .from(revenues)
        .where(
          and(
            gte(revenues.date, startDate),
            sql`${revenues.date} <= ${endDate}`
          )
        );
      
      result.push({
        name: months[i],
        expenses: Number(monthExpenses[0]?.total || 0),
        revenue: Number(monthRevenues[0]?.total || 0)
      });
    }
    
    return result;
  }
}

// Use in-memory storage for development
export const storage = new MemStorage();
