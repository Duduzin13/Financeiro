export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          type: 'income' | 'expense'
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          type: 'income' | 'expense'
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'income' | 'expense'
          created_at?: string
          user_id?: string
        }
      }
      transactions: {
        Row: {
          id: string
          description: string
          amount: number
          type: 'income' | 'expense'
          category_id: string | null
          date: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          type: 'income' | 'expense'
          category_id?: string | null
          date: string
          created_at?: string
          user_id?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          type?: 'income' | 'expense'
          category_id?: string | null
          date?: string
          created_at?: string
          user_id?: string
        }
      }
    }
    Functions: {
      calculate_monthly_totals: {
        Args: Record<string, never>
        Returns: {
          month: string
          total_income: number
          total_expenses: number
          balance: number
        }[]
      }
    }
  }
}
