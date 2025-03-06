import { getSupabase } from "./supabase"

export type Income = {
  id: string
  description: string
  amount: number
}

export type ExpenseCategory = "Alimentação" | "Carro" | "Residência" | "Educação" | "Saúde" | "Outros"

export type Expense = {
  id: string
  description: string
  amount: number
  category: "essential" | "non-essential"
  expenseCategory: ExpenseCategory
}

export const expenseCategories: ExpenseCategory[] = [
  "Alimentação",
  "Carro",
  "Residência",
  "Educação",
  "Saúde",
  "Outros",
]

export async function addIncome(userId: string, income: Omit<Income, "id">) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("incomes")
    .insert({ ...income, user_id: userId })
    .select()
    .single()

  if (error) throw error
  return { id: data.id, ...income }
}

export async function updateIncome(userId: string, income: Income) {
  const supabase = getSupabase()
  const { error } = await supabase
    .from("incomes")
    .update({ description: income.description, amount: income.amount })
    .eq("id", income.id)
    .eq("user_id", userId)

  if (error) throw error
}

export async function deleteIncome(userId: string, incomeId: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from("incomes").delete().eq("id", incomeId).eq("user_id", userId)

  if (error) throw error
}

export async function getIncomes(userId: string): Promise<Income[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("incomes").select("*").eq("user_id", userId)

  if (error) throw error
  return data as Income[]
}

export async function addExpense(userId: string, expense: Omit<Expense, "id">) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expense_category: expense.expenseCategory,
      user_id: userId,
    })
    .select()
    .single()

  if (error) throw error
  return { id: data.id, ...expense }
}

export async function updateExpense(userId: string, expense: Expense) {
  const supabase = getSupabase()
  const { error } = await supabase
    .from("expenses")
    .update({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expense_category: expense.expenseCategory,
    })
    .eq("id", expense.id)
    .eq("user_id", userId)

  if (error) throw error
}

export async function deleteExpense(userId: string, expenseId: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from("expenses").delete().eq("id", expenseId).eq("user_id", userId)

  if (error) throw error
}

export async function getExpenses(userId: string): Promise<Expense[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from("expenses").select("*").eq("user_id", userId)

  if (error) throw error

  return data.map((item) => ({
    id: item.id,
    description: item.description,
    amount: item.amount,
    category: item.category,
    expenseCategory: item.expense_category,
  })) as Expense[]
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function calculateTotalIncome(incomes: Income[]): number {
  return incomes.reduce((total, income) => total + income.amount, 0)
}

export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

export function calculateBalance(incomes: Income[], expenses: Expense[]): number {
  const totalIncome = calculateTotalIncome(incomes)
  const totalExpenses = calculateTotalExpenses(expenses)
  return totalIncome - totalExpenses
}

export function calculateEmergencyFund(expenses: Expense[]): number {
  // Emergency fund is typically 3-6 months of expenses
  return calculateTotalExpenses(expenses) * 6
}

export const initialIncomes: Income[] = []
export const initialEssentialExpenses: Expense[] = []
export const initialNonEssentialExpenses: Expense[] = []

