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
    
    const { data, error } = await query.returns<Category[]>();
    
    if (error) {
      console.error("Erro ao buscar categorias:", error);
      throw error;
    }
    return data || [];
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
      .single()
      .returns<Category>();
    
    if (error) {
      console.error("Erro ao criar categoria:", error);
      throw error;
    }
    return data;
  },

  async updateCategory(id: string, category: Partial<Omit<Category, 'id' | 'created_at' | 'user_id'>>): Promise<Category> {
    const { data, error } = await getSupabase()
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()
      .returns<Category>();
    
    if (error) {
      console.error("Erro ao atualizar categoria:", error);
      throw error;
    }
    return data;
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
        user_id: userData.user.id
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
    const { data, error } = await getSupabase()
      .from('incomes')
      .update(income)
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
      .order('date', { ascending: false })
      .returns<TransactionWithCategory[]>();
    
    if (error) throw error;
    return data || [];
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>): Promise<Transaction> {
    const { data, error } = await getSupabase()
      .from('transactions')
      .insert(transaction)
      .select()
      .single()
      .returns<Transaction>();
    
    if (error) throw error;
    return data;
  },

  async getDashboardData(): Promise<DashboardData> {
    try {
      const { data: transactions, error: transactionsError } = await getSupabase()
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .limit(5)
        .returns<Transaction[]>();

      if (transactionsError) throw transactionsError;

      // Buscar os totais mensais
      const { data, error } = await getSupabase()
        .from('monthly_totals_view')
        .select('*')
        .returns<MonthlyTotal[]>();

      // Valor padrão para os totais mensais
      const defaultMonthlyTotal: MonthlyTotal = {
        month: new Date().toISOString(),
        total_income: 0,
        total_expenses: 0,
        balance: 0
      };

      // Se houver erro ou nenhum dado, retorna o valor padrão
      const monthlyTotals = error || !data ? [defaultMonthlyTotal] : data;

      return {
        recentTransactions: transactions || [],
        monthlyTotals
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      return {
        recentTransactions: [],
        monthlyTotals: [{
          month: new Date().toISOString(),
          total_income: 0,
          total_expenses: 0,
          balance: 0
        }]
      };
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
};
