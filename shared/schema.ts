import { pgTable, text, serial, integer, boolean, date, foreignKey, timestamp, numeric, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  businessType: text("business_type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastPurchaseDate: timestamp("last_purchase_date"),
  notes: text("notes"),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  email: true,
  phone: true,
  businessType: true,
  notes: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Expenses table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  dueDate: date("due_date"),
  notes: text("notes"),
  currency: text("currency").notNull().default("USD"),
  account: text("account").default("default"),
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  category: true,
  date: true,
  dueDate: true,
  notes: true,
  currency: true,
  account: true,
  isPaid: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Revenues table
export const revenues = pgTable("revenues", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  category: text("category").notNull(),
  date: date("date").notNull(),
  dueDate: date("due_date"),
  notes: text("notes"),
  currency: text("currency").notNull().default("USD"),
  account: text("account").default("default"),
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRevenueSchema = createInsertSchema(revenues).pick({
  description: true,
  amount: true,
  clientId: true,
  category: true,
  date: true,
  dueDate: true,
  notes: true,
  currency: true,
  account: true,
  isPaid: true,
}).transform((data) => {
  return {
    ...data,
    // Ensure clientId is always a number
    clientId: typeof data.clientId === 'string' ? Number(data.clientId) : data.clientId,
  };
});

export type InsertRevenue = z.infer<typeof insertRevenueSchema>;
export type Revenue = typeof revenues.$inferSelect;

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  status: text("status").notNull().default("Pending"),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  validUntil: date("valid_until"),
  notes: text("notes"),
});

export const insertQuoteSchema = createInsertSchema(quotes).pick({
  jobTitle: true,
  jobDescription: true,
  amount: true,
  clientId: true,
  currency: true,
  validUntil: true,
  notes: true,
}).transform((data) => {
  return {
    ...data,
    // Ensure clientId is always a number
    clientId: typeof data.clientId === 'string' ? Number(data.clientId) : data.clientId,
  };
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  frequency: text("frequency").notNull().default("monthly"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  currency: text("currency").notNull().default("USD"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  name: true,
  amount: true,
  clientId: true,
  frequency: true,
  startDate: true,
  endDate: true,
  isActive: true,
  currency: true,
  description: true,
}).transform((data) => {
  return {
    ...data,
    // Ensure clientId is always a number
    clientId: typeof data.clientId === 'string' ? Number(data.clientId) : data.clientId,
  };
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  quoteId: integer("quote_id").references(() => quotes.id),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  description: true,
}).extend({
  quoteId: z.union([z.string(), z.number()]).nullable().optional().transform(val => 
    val === null ? null : typeof val === 'string' ? parseInt(val) : val
  ),
  file: z.any(),
});

export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'level_up', 'transaction_due', 'invitation_accepted'
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  relatedEntityType: text("related_entity_type"), // 'expense', 'revenue', 'subscription', etc.
  relatedEntityId: integer("related_entity_id"),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  relatedEntityType: true,
  relatedEntityId: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Finance Categories (for user customization)
export const financeCategories = pgTable("finance_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  value: text("value").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull(), // 'expense' or 'revenue'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFinanceCategorySchema = createInsertSchema(financeCategories).pick({
  userId: true,
  value: true,
  label: true,
  type: true,
});

export type InsertFinanceCategory = z.infer<typeof insertFinanceCategorySchema>;
export type FinanceCategory = typeof financeCategories.$inferSelect;

// Finance Accounts (for user customization)
export const financeAccounts = pgTable("finance_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  value: text("value").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull().default("default"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFinanceAccountSchema = createInsertSchema(financeAccounts).pick({
  userId: true,
  value: true,
  label: true,
  icon: true,
});

export type InsertFinanceAccount = z.infer<typeof insertFinanceAccountSchema>;
export type FinanceAccount = typeof financeAccounts.$inferSelect;
