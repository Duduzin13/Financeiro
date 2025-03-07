# Migração da Relação entre Despesas e Categorias

Este documento explica as alterações feitas para implementar uma relação adequada entre as tabelas `expenses` e `categories` no banco de dados Supabase.

## Problema Original

Anteriormente, a tabela `expenses` armazenava apenas o nome da categoria como uma string no campo `category`. Isso causava problemas quando tentávamos fazer consultas que envolviam junções entre as tabelas `expenses` e `categories`, resultando em erros como:

```
[SupabaseService] Erro ao buscar maiores despesas: Object
code: "PGRST200"
details: "Searched for a foreign key relationship between 'expenses' and 'categories' in the schema 'public', but no matches were found."
hint: null
message: "Could not find a relationship between 'expenses' and 'categories' in the schema cache"
```

## Solução Implementada

Para resolver esse problema, implementamos as seguintes alterações:

1. **Alterações no Banco de Dados**:
   - Adicionamos uma coluna `category_id` à tabela `expenses` que é uma chave estrangeira para a tabela `categories`
   - Migramos os dados existentes para usar a nova relação
   - Criamos índices e restrições para garantir a integridade dos dados

2. **Alterações no Código**:
   - Atualizamos os tipos TypeScript para refletir a nova estrutura
   - Modificamos os métodos de serviço para usar a nova relação
   - Mantivemos compatibilidade com o código existente durante a transição

## Como Aplicar as Alterações

### 1. Alterações no Banco de Dados

Execute o script `apply_db_changes.bat` (Windows) ou `apply_db_changes.sh` (Linux/Mac) para aplicar as alterações no banco de dados. Este script irá guiá-lo através do processo de aplicação das alterações no painel administrativo do Supabase.

### 2. Alterações no Código

As alterações no código já foram aplicadas e estão prontas para usar a nova estrutura. Os principais arquivos modificados são:

- `services/supabaseService.ts`: Atualizado para usar a nova relação
- `types/index.ts`: Adicionados novos tipos para refletir a nova estrutura

## Benefícios da Nova Estrutura

- **Integridade Referencial**: Garante que cada despesa esteja associada a uma categoria válida
- **Consultas Mais Eficientes**: Permite consultas mais eficientes e complexas entre despesas e categorias
- **Melhor Organização dos Dados**: Facilita a manutenção e evolução do banco de dados

## Notas Importantes

- A coluna `category` original foi mantida temporariamente para garantir compatibilidade com o código existente
- Em uma futura atualização, podemos remover a coluna `category` quando todo o código estiver usando a nova estrutura
- Certifique-se de testar todas as funcionalidades relacionadas a despesas e categorias após aplicar as alterações 