# Controle Financeiro App

Um aplicativo de controle financeiro pessoal desenvolvido com Next.js, Tailwind CSS, e Supabase.

## Configuração do Projeto

Siga os passos abaixo para configurar o projeto em sua máquina local.

### Pré-requisitos

- Node.js 16.8 ou superior
- npm ou yarn
- Uma conta no Supabase (gratuita)

## Configuração do Supabase

Este aplicativo requer um projeto Supabase configurado corretamente. Siga estas etapas para configurar seu projeto Supabase:

### 1. Criar um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/) e faça login
2. Clique em "New Project"
3. Preencha os detalhes do projeto e crie-o
4. Anote a URL e a chave anônima (encontradas em Project Settings > API)

### 2. Configurar as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 3. Criar as tabelas necessárias

O aplicativo requer as seguintes tabelas no Supabase:
- `profiles`: Para armazenar informações do usuário
- `categories`: Para categorias de transações
- `incomes`: Para registros de receitas
- `expenses`: Para registros de despesas

Para criar estas tabelas:

1. No painel do Supabase, vá para "SQL Editor"
2. Crie um novo query
3. Cole o conteúdo do arquivo `supabase_fix.sql` ou `supabase_schema.sql`
4. Execute a query

Alternativamente, você pode executar o arquivo `supabase_fix.sql` que criamos para verificar se as tabelas já existem e criar as faltantes.

### 4. Configurar autenticação

1. No painel do Supabase, vá para "Authentication" > "Providers"
2. Habilite "Email"
3. Se desejar usar login com Google:
   - Habilite "Google"
   - Configure as credenciais OAuth do Google Cloud (veja instruções na documentação do Supabase)
   - Adicione o URL de redirecionamento do Supabase no console do Google Cloud

### 5. Resolução de problemas

Se você encontrar erros 403 (Forbidden) ao tentar acessar as tabelas, verifique:

1. Se todas as tabelas foram criadas corretamente
2. Se as políticas Row Level Security (RLS) estão configuradas
3. Se o usuário está autenticado antes de tentar acessar os dados
4. Se as variáveis de ambiente estão configuradas corretamente

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd controle-financeiro-app
```

2. Instale as dependências:
```bash
npm install
# ou
yarn
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

## Estrutura do Projeto

O projeto utiliza a estrutura de Pages Router do Next.js:

- `pages/`: Contém as páginas da aplicação
  - `_app.tsx`: Configuração global da aplicação
  - `index.tsx`: Página inicial
  - `login.tsx`: Página de login
  - `signup.tsx`: Página de cadastro
  - `dashboard.tsx`: Dashboard principal
  - `income.tsx`: Gerenciamento de receitas
  - `expenses.tsx`: Gerenciamento de despesas
  - `reports.tsx`: Relatórios financeiros
  - `settings.tsx`: Configurações da conta
  - `categories.tsx`: Gerenciamento de categorias
  
- `components/`: Componentes reutilizáveis
  - `auth/`: Componentes de autenticação
  - `ui/`: Componentes de interface (botões, cards, etc.)
  - `auth-provider.tsx`: Provedor de contexto de autenticação
  - `bottom-navigation.tsx`: Barra de navegação inferior

- `services/`: Serviços e integrações
  - `supabaseService.ts`: Serviço para comunicação com Supabase

- `lib/`: Utilitários e configuração
  - `supabase.ts`: Configuração do cliente Supabase

- `styles/`: Arquivos de estilo
  - `globals.css`: Estilos globais da aplicação

## Funcionalidades

- Autenticação de usuários (email/senha e Google)
- Registro e gerenciamento de receitas
- Registro e gerenciamento de despesas
- Categorização de transações financeiras
- Dashboard com resumo financeiro
- Relatórios com gráficos e análises
- Configurações de conta

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Shadcn UI](https://ui.shadcn.com/)

## Licença

Este projeto está licenciado sob a licença MIT.

## Suporte

Para suporte, entre em contato através do email: [seu-email@exemplo.com]

