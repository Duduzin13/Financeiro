-- Adicionar coluna is_recurrent à tabela incomes
ALTER TABLE incomes 
ADD COLUMN IF NOT EXISTS is_recurrent BOOLEAN DEFAULT false;

-- Atualizar registros existentes
UPDATE incomes SET is_recurrent = false WHERE is_recurrent IS NULL; 