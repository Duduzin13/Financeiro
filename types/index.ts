export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  created_at: string;
  user_id: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category_id: string | null;
  category?: string; // Campo legado, mantido para compatibilidade
  is_essential: boolean;
  created_at: string;
  user_id: string;
};

export type ExpenseWithCategory = Expense & {
  categories: Category | null;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  date: string;
  created_at: string;
  user_id: string;
};

export type TransactionWithCategory = Transaction & {
  category: Category;
};

export type MonthlyTotal = {
  month: string;
  total_income: number;
  total_expenses: number;
  balance: number;
};

export type DashboardData = {
  recentTransactions: Transaction[];
  monthlyTotals: MonthlyTotal[];
};

// Tipos do Supabase
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'user_id'>;
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'user_id'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'user_id'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'user_id'>>;
      };
    };
    Functions: {
      calculate_monthly_totals: {
        Args: Record<string, never>;
        Returns: MonthlyTotal[];
      };
    };
  };
}
