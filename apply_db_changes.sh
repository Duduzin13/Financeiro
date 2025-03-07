#!/bin/bash

# Script para aplicar as alterações no banco de dados Supabase
# Este script deve ser executado a partir do terminal

echo "Aplicando alterações no banco de dados Supabase..."
echo "Certifique-se de estar logado no Supabase CLI antes de continuar."
echo ""

# Verificar se o arquivo SQL existe
if [ ! -f "supabase_relation_fix.sql" ]; then
  echo "Erro: O arquivo supabase_relation_fix.sql não foi encontrado."
  exit 1
fi

echo "Este script irá:"
echo "1. Adicionar uma coluna category_id à tabela expenses"
echo "2. Migrar os dados existentes para usar a nova relação"
echo "3. Criar índices e restrições para garantir a integridade dos dados"
echo ""
echo "Deseja continuar? (s/n)"
read -r resposta

if [ "$resposta" != "s" ]; then
  echo "Operação cancelada."
  exit 0
fi

echo ""
echo "Para aplicar as alterações, você precisa:"
echo "1. Fazer login no painel administrativo do Supabase"
echo "2. Ir para o Editor SQL"
echo "3. Copiar e colar o conteúdo do arquivo supabase_relation_fix.sql"
echo "4. Executar o script"
echo ""
echo "Deseja abrir o arquivo SQL para copiar seu conteúdo? (s/n)"
read -r resposta

if [ "$resposta" = "s" ]; then
  # Tentar abrir o arquivo com o editor padrão
  if command -v xdg-open &> /dev/null; then
    xdg-open supabase_relation_fix.sql
  elif command -v open &> /dev/null; then
    open supabase_relation_fix.sql
  elif command -v start &> /dev/null; then
    start supabase_relation_fix.sql
  else
    echo "Não foi possível abrir o arquivo automaticamente."
    echo "Por favor, abra o arquivo supabase_relation_fix.sql manualmente."
  fi
fi

echo ""
echo "Após aplicar as alterações no banco de dados, reinicie a aplicação para que as mudanças tenham efeito."
echo "Lembre-se de que as alterações no código já foram aplicadas e estão prontas para usar a nova estrutura."
echo ""
echo "Processo concluído!" 