-- Script para verificar e criar as tabelas necessárias no Supabase
-- Executar este script no Editor SQL do painel administrativo do Supabase

-- Verificar tabelas existentes
DO $$
DECLARE
    tables_missing BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Verificando a existência das tabelas necessárias...';
    
    -- Verifica a tabela profiles
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        RAISE NOTICE 'A tabela "profiles" não existe.';
        tables_missing := TRUE;
    ELSE
        RAISE NOTICE 'A tabela "profiles" existe.';
    END IF;
    
    -- Verifica a tabela categories
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        RAISE NOTICE 'A tabela "categories" não existe.';
        tables_missing := TRUE;
    ELSE
        RAISE NOTICE 'A tabela "categories" existe.';
    END IF;
    
    -- Verifica a tabela incomes
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'incomes') THEN
        RAISE NOTICE 'A tabela "incomes" não existe.';
        tables_missing := TRUE;
    ELSE
        RAISE NOTICE 'A tabela "incomes" existe.';
    END IF;
    
    -- Verifica a tabela expenses
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expenses') THEN
        RAISE NOTICE 'A tabela "expenses" não existe.';
        tables_missing := TRUE;
    ELSE
        RAISE NOTICE 'A tabela "expenses" existe.';
    END IF;
    
    IF tables_missing THEN
        RAISE NOTICE 'Algumas tabelas estão faltando. Execute o script de criação de tabelas a seguir.';
    ELSE
        RAISE NOTICE 'Todas as tabelas necessárias existem.';
    END IF;
END $$;

-- Extender uuid-generate se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'both', -- 'income', 'expense', ou 'both'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela incomes
CREATE TABLE IF NOT EXISTS public.incomes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category TEXT,
  is_essential BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ativar RLS para todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY IF NOT EXISTS "Usuários podem ver apenas seus próprios perfis" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar apenas seus próprios perfis" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para categories
CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias categorias" 
ON public.categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias categorias" 
ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar suas próprias categorias" 
ON public.categories FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem excluir suas próprias categorias" 
ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para incomes
CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias receitas" 
ON public.incomes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias receitas" 
ON public.incomes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar suas próprias receitas" 
ON public.incomes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem excluir suas próprias receitas" 
ON public.incomes FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para expenses
CREATE POLICY IF NOT EXISTS "Usuários podem ver suas próprias despesas" 
ON public.expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem criar suas próprias despesas" 
ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem atualizar suas próprias despesas" 
ON public.expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Usuários podem excluir suas próprias despesas" 
ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Criar função e trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile_for_user();

-- Função para inserir categorias padrão
CREATE OR REPLACE FUNCTION public.insert_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (name, type, user_id)
  VALUES 
    ('Salário', 'income', NEW.id),
    ('Investimentos', 'income', NEW.id),
    ('Freelance', 'income', NEW.id),
    ('Presente', 'income', NEW.id),
    ('Alimentação', 'expense', NEW.id),
    ('Transporte', 'expense', NEW.id),
    ('Moradia', 'expense', NEW.id),
    ('Lazer', 'expense', NEW.id),
    ('Saúde', 'expense', NEW.id),
    ('Educação', 'expense', NEW.id),
    ('Outros', 'both', NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para inserir categorias padrão
DROP TRIGGER IF EXISTS insert_default_categories_trigger ON auth.users;
CREATE TRIGGER insert_default_categories_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.insert_default_categories();

-- Adicionar campo type para categorias existentes (migração de dados)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'type') THEN
      RAISE NOTICE 'O campo type já existe na tabela categories.';
    ELSE
      ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'both';
      -- Atualizar categorias existentes para um tipo adequado
      UPDATE public.categories SET type = 'income' WHERE name IN ('Salário', 'Investimentos', 'Freelance', 'Presente');
      UPDATE public.categories SET type = 'expense' WHERE name IN ('Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação');
      UPDATE public.categories SET type = 'both' WHERE name = 'Outros';
    END IF;
  END IF;
END
$$; 