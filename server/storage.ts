import { users, type User, type InsertUser, transactions, type Transaction, type InsertTransaction } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction related methods
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  currentUserId: number;
  currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
    
    // Add some initial transactions for demonstration
    const sampleTransactions: InsertTransaction[] = [
      { description: "Salary", amount: 200000, category: "salary" }, // $2000.00
      { description: "Groceries", amount: -15000, category: "food" }, // -$150.00
      { description: "Freelance Project", amount: 50000, category: "freelance" }, // $500.00
      { description: "Electricity Bill", amount: -7500, category: "utilities" }, // -$75.00
      { description: "Movie Night", amount: -2500, category: "entertainment" }, // -$25.00
    ];
    
    sampleTransactions.forEach(tx => this.createTransaction(tx));
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
}

export const storage = new MemStorage();
