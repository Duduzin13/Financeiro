@echo off
echo Fazendo commit das alteracoes...
git add lib/auth-redirect.js lib/supabase.ts components/auth/login-form.tsx components/auth/sign-up-form.tsx pages/_app.tsx services/supabaseService.ts supabase/migrations/add_is_recurrent_column.sql
git commit -m "Corrigir erro na coluna is_recurrent da tabela incomes e erros de typescript"
git push origin master
echo Concluido! 