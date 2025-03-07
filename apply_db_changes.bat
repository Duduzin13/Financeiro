@echo off
REM Script para aplicar as alterações no banco de dados Supabase
REM Este script deve ser executado a partir do terminal Windows

echo Aplicando alterações no banco de dados Supabase...
echo Certifique-se de estar logado no Supabase CLI antes de continuar.
echo.

REM Verificar se o arquivo SQL existe
if not exist "supabase_relation_fix.sql" (
  echo Erro: O arquivo supabase_relation_fix.sql não foi encontrado.
  exit /b 1
)

echo Este script irá:
echo 1. Adicionar uma coluna category_id à tabela expenses
echo 2. Migrar os dados existentes para usar a nova relação
echo 3. Criar índices e restrições para garantir a integridade dos dados
echo.
set /p resposta="Deseja continuar? (s/n): "

if /i "%resposta%" neq "s" (
  echo Operação cancelada.
  exit /b 0
)

echo.
echo Para aplicar as alterações, você precisa:
echo 1. Fazer login no painel administrativo do Supabase
echo 2. Ir para o Editor SQL
echo 3. Copiar e colar o conteúdo do arquivo supabase_relation_fix.sql
echo 4. Executar o script
echo.
set /p resposta="Deseja abrir o arquivo SQL para copiar seu conteúdo? (s/n): "

if /i "%resposta%" equ "s" (
  REM Tentar abrir o arquivo com o editor padrão
  start supabase_relation_fix.sql
)

echo.
echo Após aplicar as alterações no banco de dados, reinicie a aplicação para que as mudanças tenham efeito.
echo Lembre-se de que as alterações no código já foram aplicadas e estão prontas para usar a nova estrutura.
echo.
echo Processo concluído!
pause 