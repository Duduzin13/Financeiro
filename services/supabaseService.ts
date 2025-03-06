import { getSupabase } from '@/lib/supabase';
import { Category, Transaction, TransactionWithCategory, DashboardData, MonthlyTotal } from '@/types';

// Tipos para criação/atualização de dados
export type IncomeInput = {
  description: string
  amount: number
  category?: string
  is_recurrent?: boolean
}

export const supabaseService = {
  // Categorias
  async getCategories(type?: 'income' | 'expense' | 'both'): Promise<Category[]> {
    const query = getSupabase()
      .from('categories')
      .select('*')
      .order('name');
    
    // Se um tipo específico for fornecido, filtra por esse tipo ou 'both'
    if (type) {
      query.or(`type.eq.${type},type.eq.both`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
    return (data || []) as Category[];
  },

  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'user_id'>): Promise<Category> {
    const supabase = getSupabase();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Erro ao obter usuário atual:", userError);
      throw userError;
    }
    
    if (!userData.user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        user_id: userData.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
    return data as Category;
  },

  async updateCategory(id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'user_id'>>): Promise<Category> {
    const { data, error } = await getSupabase()
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao atualizar categoria:", error);
      throw error;
    }
    return data as Category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await getSupabase()
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Erro ao excluir categoria:", error);
      throw error;
    }
    return true;
  },

  // Entradas
  async getIncomes() {
    const { data, error } = await getSupabase()
      .from('incomes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar receitas:", error);
      throw error;
    }
    return data || [];
  },

  async createIncome(income: IncomeInput) {
    const supabase = getSupabase();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Erro ao obter usuário atual:", userError);
      throw userError;
    }
    
    if (!userData.user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from('incomes')
      .insert({
        description: income.description,
        amount: income.amount,
        category: income.category || 'Geral',
        user_id: userData.user.id,
        // Remover o campo is_recurrent até que a coluna seja adicionada ao banco de dados
        // is_recurrent: income.is_recurrent || false
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar receita:", error);
      throw error;
    }
    return data;
  },

  async updateIncome(id: string, income: Partial<IncomeInput>) {
    // Copia o objeto income para não modificar o original
    const incomeData = { ...income };
    
    // Remove o campo is_recurrent até que a coluna seja adicionada
    if ('is_recurrent' in incomeData) {
      delete incomeData.is_recurrent;
    }
    
    const { data, error } = await getSupabase()
      .from('incomes')
      .update(incomeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteIncome(id: string) {
    const { error } = await getSupabase()
      .from('incomes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Despesas
  async getExpenses() {
    const { data, error } = await getSupabase()
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar despesas:", error);
      throw error;
    }
    return data || [];
  },

  async createExpense(expense: { 
    description: string; 
    amount: number; 
    category?: string;
    is_essential: boolean;
  }) {
    const supabase = getSupabase();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Erro ao obter usuário atual:", userError);
      throw userError;
    }
    
    if (!userData.user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        description: expense.description,
        amount: expense.amount,
        category: expense.category || 'Geral',
        is_essential: expense.is_essential,
        user_id: userData.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar despesa:", error);
      throw error;
    }
    return data;
  },

  async updateExpense(id: string, expense: { 
    description?: string; 
    amount?: number; 
    category?: string;
    is_essential?: boolean;
  }) {
    const { data, error } = await getSupabase()
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string) {
    try {
      const { error } = await getSupabase()
        .from('expenses')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return true
    } catch (error) {
      console.error("Erro ao excluir despesa:", error)
      throw error
    }
  },

  // Transações
  async getTransactions(): Promise<TransactionWithCategory[]> {
    const { data, error } = await getSupabase()
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return (data || []) as TransactionWithCategory[];
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>): Promise<Transaction> {
    const { data, error } = await getSupabase()
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data as Transaction;
  },

  // Obter dados do dashboard
  async getDashboardData(period = "3") {
    try {
      const months = parseInt(period)
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)
      startDate.setHours(0, 0, 0, 0)
      
      // Buscar receitas e despesas entre startDate e hoje
      const { data: incomes } = await getSupabase()
        .from('incomes')
        .select('amount, date')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: false })

      const { data: expenses } = await getSupabase()
        .from('expenses')
        .select('amount, date')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: false })

      // Define interfaces para as transações
      interface Transaction {
        amount: number;
        date: string;
      }
      
      interface MonthlyAmount {
        [key: string]: number;
      }

      // Função para agrupar transações por mês
      const groupByMonth = (transactions: Transaction[]): MonthlyAmount => {
        return transactions.reduce((acc: MonthlyAmount, transaction: Transaction) => {
          const date = new Date(transaction.date)
          const month = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
          
          if (!acc[month]) {
            acc[month] = 0
          }
          
          acc[month] += transaction.amount
          return acc
        }, {})
      }

      // Agrupar transações por mês
      const incomesByMonth = groupByMonth(incomes || [])
      const expensesByMonth = groupByMonth(expenses || [])

      // Combinar os dados e gerar monthlyTotals
      const allMonths = [...new Set([
        ...Object.keys(incomesByMonth),
        ...Object.keys(expensesByMonth)
      ])].sort().reverse()

      const monthlyTotals = allMonths.map(month => ({
        month,
        total_income: incomesByMonth[month] || 0,
        total_expenses: expensesByMonth[month] || 0,
        balance: (incomesByMonth[month] || 0) - (expensesByMonth[month] || 0)
      }))

      return { monthlyTotals }
    } catch (error) {
      console.error("Erro ao obter dados do dashboard:", error)
      return { monthlyTotals: [] }
    }
  },

  async deleteUserProfile() {
    try {
      const supabase = getSupabase()
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado")
      }
      
      const userId = userData.user.id
      
      // 1. Excluir todas as despesas do usuário
      const { error: expensesError } = await supabase
        .from('expenses')
        .delete()
        .eq('user_id', userId)
      
      if (expensesError) throw expensesError
      
      // 2. Excluir todas as receitas do usuário
      const { error: incomesError } = await supabase
        .from('incomes')
        .delete()
        .eq('user_id', userId)
      
      if (incomesError) throw incomesError
      
      // 3. Excluir todas as categorias do usuário
      const { error: categoriesError } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', userId)
      
      if (categoriesError) throw categoriesError
      
      // 4. Excluir o perfil do usuário (se houver uma tabela de perfis)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      
      // Ignoramos o erro se a tabela de perfis não existir
      
      // 5. Finalmente, excluir a conta do usuário
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)
      
      // Como a API admin pode não estar disponível para todos, vamos tentar uma abordagem alternativa
      if (deleteUserError) {
        // Alternativa: solicitar que o usuário seja excluído
        const { error: signOutError } = await supabase.auth.signOut()
        
        if (signOutError) throw signOutError
        
        throw new Error("Todos os seus dados foram excluídos. Contate o suporte para remover sua conta permanentemente.")
      }
      
      return true
    } catch (error) {
      console.error("Erro ao excluir perfil:", error)
      throw error
    }
  },

  // Obter despesas por categoria
  async getExpensesByCategory(period = "3") {
    try {
      const months = parseInt(period)
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)
      startDate.setHours(0, 0, 0, 0)
      
      const { data, error } = await getSupabase()
        .from('expenses')
        .select(`
          amount,
          categories!inner(name)
        `)
        .gte('date', startDate.toISOString())
        .order('amount', { ascending: false })
      
      if (error) throw error
      
      // Define tipos para os dados
      interface CategoryExpense {
        category_name: string;
        total_amount: number;
      }
      
      // Agrupa despesas por categoria
      const expensesByCategory = data.reduce((acc: CategoryExpense[], expense: any) => {
        const categoryName = expense.categories?.name || 'Sem Categoria'
        const existingCategory = acc.find((cat: CategoryExpense) => cat.category_name === categoryName)
        
        if (existingCategory) {
          existingCategory.total_amount += expense.amount
        } else {
          acc.push({
            category_name: categoryName,
            total_amount: expense.amount
          })
        }
        
        return acc
      }, [] as CategoryExpense[])
      
      // Ordena por valor total (maior para menor)
      expensesByCategory.sort((a: CategoryExpense, b: CategoryExpense) => b.total_amount - a.total_amount)
      
      return { data: expensesByCategory, error: null }
    } catch (error) {
      console.error("Erro ao obter despesas por categoria:", error)
      return { data: [], error }
    }
  },

  // Obter as maiores despesas
  async getTopExpenses(period = "3", limit = 5) {
    try {
      const months = parseInt(period)
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)
      startDate.setHours(0, 0, 0, 0)
      
      const { data, error } = await getSupabase()
        .from('expenses')
        .select(`
          amount,
          description,
          categories!inner(name)
        `)
        .gte('date', startDate.toISOString())
        .order('amount', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      
      interface Expense {
        amount: number;
        description: string;
        categories: { name: string };
      }
      
      const formattedData = data.map((expense: Expense) => ({
        amount: expense.amount,
        description: expense.description,
        category_name: expense.categories?.name || 'Sem Categoria'
      }))
      
      return { data: formattedData, error: null }
    } catch (error) {
      console.error("Erro ao obter maiores despesas:", error)
      return { data: [], error }
    }
  },
};
