-- Migração Completa do Controle Financeiro App
-- Versão consolidada de todos os arquivos de migração

-- Habilitar a extensão UUID se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------
-- TABELAS PRINCIPAIS
-------------------------------------------------------

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de receitas
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT,
  expense_category TEXT,
  is_essential BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de transações (unificada - opcional)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-------------------------------------------------------
-- ATIVAR ROW LEVEL SECURITY (RLS)
-------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------
-- POLÍTICAS DE SEGURANÇA
-------------------------------------------------------

-- Políticas para perfis
CREATE POLICY "Usuários podem ver apenas seus próprios perfis" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios perfis" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para categorias
CREATE POLICY "Usuários podem ver suas próprias categorias" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias categorias" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias categorias" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias categorias" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para receitas
CREATE POLICY "Usuários podem ver suas próprias receitas" ON public.incomes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias receitas" ON public.incomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias receitas" ON public.incomes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias receitas" ON public.incomes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para despesas
CREATE POLICY "Usuários podem ver suas próprias despesas" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias despesas" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias despesas" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias despesas" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para transações
CREATE POLICY "Usuários podem ver suas próprias transações" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias transações" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias transações" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias transações" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------
-- FUNÇÕES E TRIGGERS
-------------------------------------------------------

-- Função para criar o perfil automaticamente após o cadastro
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile_for_user();

-- Inserir algumas categorias padrão para novos usuários
CREATE OR REPLACE FUNCTION public.insert_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (name, type, user_id)
  VALUES 
    ('Salário', 'income', NEW.id),
    ('Investimentos', 'income', NEW.id),
    ('Freelance', 'income', NEW.id),
    ('Outros', 'income', NEW.id),
    ('Alimentação', 'expense', NEW.id),
    ('Transporte', 'expense', NEW.id),
    ('Moradia', 'expense', NEW.id),
    ('Lazer', 'expense', NEW.id),
    ('Saúde', 'expense', NEW.id),
    ('Educação', 'expense', NEW.id),
    ('Vestuário', 'expense', NEW.id),
    ('Outros', 'expense', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para inserir categorias padrão
DROP TRIGGER IF EXISTS insert_default_categories_trigger ON auth.users;
CREATE TRIGGER insert_default_categories_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.insert_default_categories();

-- Função para calcular totais mensais
CREATE OR REPLACE FUNCTION calculate_monthly_totals()
RETURNS TABLE (
    month DATE,
    total_income DECIMAL,
    total_expenses DECIMAL,
    balance DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH monthly_transactions AS (
        SELECT
            DATE_TRUNC('month', date)::DATE as month,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
        FROM transactions
        WHERE user_id = auth.uid()
        GROUP BY DATE_TRUNC('month', date)
    )
    SELECT
        month,
        income as total_income,
        expenses as total_expenses,
        (income - expenses) as balance
    FROM monthly_transactions
    ORDER BY month DESC
    LIMIT 12;

    -- Se não houver resultados, retorna o mês atual com zeros
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            DATE_TRUNC('month', CURRENT_DATE)::DATE as month,
            0::DECIMAL as total_income,
            0::DECIMAL as total_expenses,
            0::DECIMAL as balance;
    END IF;
END;
$$;

-------------------------------------------------------
-- VIEWS
-------------------------------------------------------

-- View para calcular totais mensais (versão para transações)
CREATE OR REPLACE VIEW public.monthly_totals_view AS
WITH income_months AS (
  SELECT 
    date_trunc('month', created_at) AS month,
    user_id
  FROM public.incomes
  GROUP BY date_trunc('month', created_at), user_id
),
expense_months AS (
  SELECT 
    date_trunc('month', created_at) AS month,
    user_id
  FROM public.expenses
  GROUP BY date_trunc('month', created_at), user_id
),
all_months AS (
  SELECT month, user_id FROM income_months
  UNION
  SELECT month, user_id FROM expense_months
)
SELECT 
  am.month,
  COALESCE((
    SELECT SUM(i.amount) 
    FROM public.incomes i 
    WHERE date_trunc('month', i.created_at) = am.month
    AND i.user_id = am.user_id
  ), 0) AS total_income,
  COALESCE((
    SELECT SUM(e.amount) 
    FROM public.expenses e 
    WHERE date_trunc('month', e.created_at) = am.month
    AND e.user_id = am.user_id
  ), 0) AS total_expenses,
  COALESCE((
    SELECT SUM(i.amount) 
    FROM public.incomes i 
    WHERE date_trunc('month', i.created_at) = am.month
    AND i.user_id = am.user_id
  ), 0) - COALESCE((
    SELECT SUM(e.amount) 
    FROM public.expenses e 
    WHERE date_trunc('month', e.created_at) = am.month
    AND e.user_id = am.user_id
  ), 0) AS balance,
  am.user_id
FROM all_months am
ORDER BY am.month DESC;

-- View alternativa para totais mensais (baseada em transações)
CREATE OR REPLACE VIEW public.monthly_transactions_view AS
WITH monthly_transactions AS (
    SELECT
        DATE_TRUNC('month', date)::DATE as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
    FROM transactions
    WHERE user_id = auth.uid()
    GROUP BY DATE_TRUNC('month', date)
)
SELECT
    month,
    total_income,
    total_expenses,
    (total_income - total_expenses) as balance
FROM monthly_transactions
UNION ALL
SELECT
    DATE_TRUNC('month', CURRENT_DATE)::DATE as month,
    0::DECIMAL as total_income,
    0::DECIMAL as total_expenses,
    0::DECIMAL as balance
WHERE NOT EXISTS (SELECT 1 FROM monthly_transactions)
ORDER BY month DESC
LIMIT 12;

-- Comentário para a view
COMMENT ON VIEW public.monthly_totals_view IS 'View que exibe os totais financeiros mensais por usuário';
COMMENT ON VIEW public.monthly_transactions_view IS 'View alternativa que exibe os totais mensais baseados em transações'; 