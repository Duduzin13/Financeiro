-- Script para modificar a tabela expenses e criar uma relação com a tabela categories
-- Executar este script no Editor SQL do painel administrativo do Supabase

-- Primeiro, vamos adicionar uma nova coluna category_id que será a chave estrangeira
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- Agora, vamos migrar os dados existentes
-- Para cada despesa, vamos encontrar a categoria correspondente pelo nome e atualizar o category_id
DO $$
DECLARE
    expense_record RECORD;
    category_id UUID;
BEGIN
    FOR expense_record IN SELECT id, category, user_id FROM public.expenses WHERE category IS NOT NULL AND category != '' LOOP
        -- Buscar o ID da categoria pelo nome e user_id
        SELECT id INTO category_id 
        FROM public.categories 
        WHERE name = expense_record.category 
        AND user_id = expense_record.user_id
        LIMIT 1;
        
        -- Se encontrou a categoria, atualiza a despesa
        IF category_id IS NOT NULL THEN
            UPDATE public.expenses 
            SET category_id = category_id 
            WHERE id = expense_record.id;
        END IF;
    END LOOP;
END $$;

-- Criar um índice para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS expenses_category_id_idx ON public.expenses(category_id);

-- Adicionar uma restrição para garantir que a categoria pertence ao mesmo usuário da despesa
ALTER TABLE public.expenses 
DROP CONSTRAINT IF EXISTS expenses_category_user_match;

CREATE OR REPLACE FUNCTION check_expense_category_user_match()
RETURNS TRIGGER AS $$
DECLARE
    category_user_id UUID;
BEGIN
    IF NEW.category_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    SELECT user_id INTO category_user_id 
    FROM public.categories 
    WHERE id = NEW.category_id;
    
    IF category_user_id != NEW.user_id THEN
        RAISE EXCEPTION 'A categoria deve pertencer ao mesmo usuário da despesa';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS expense_category_user_match_trigger ON public.expenses;
CREATE TRIGGER expense_category_user_match_trigger
BEFORE INSERT OR UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION check_expense_category_user_match();

-- Nota: Não vamos remover a coluna 'category' imediatamente para manter compatibilidade
-- com o código existente durante a transição. Podemos removê-la posteriormente quando
-- todo o código estiver atualizado para usar category_id. 