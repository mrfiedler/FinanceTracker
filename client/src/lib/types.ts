export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string | Date;
  type: 'income' | 'expense';
  categoryId: number;
  categoryName?: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface MonthlySummary {
  id: number;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
}
