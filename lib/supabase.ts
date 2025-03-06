import { createClient } from "@supabase/supabase-js"

// Variáveis de ambiente ou valores padrão para produção
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lfektiroskyzruqjvlhw.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZWt0aXJvc2t5enJ1cWp2bGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNzkyNjMsImV4cCI6MjA1Njc1NTI2M30.sTuqp2PKK9bnLwhUib2Knof3cWQb2XtysozN_vv1x_E"

let supabase: ReturnType<typeof createClient> | null = null

export function initSupabase() {
  if (supabase) return supabase

  try {
    console.log("Inicializando Supabase com URL:", supabaseUrl)
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Atenção: Usando valores de fallback para Supabase. Isto pode não ser ideal para produção.");
    }
    
    // Determinar a URL base para redirecionamentos OAuth
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin
      : 'https://financeiro-control.netlify.app';
    
    // Criar o cliente Supabase com a configuração atualizada
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // Usar flowType "pkce" em vez de "implicit" para maior segurança e melhor compatibilidade
        flowType: 'pkce',
        // Adicionamos sites URL para evitar problemas de redirecionamento
        redirectTo: `${baseUrl}/dashboard`,
        // Configurar o site URL para garantir que os emails de confirmação apontem para o endereço correto
        site_url: baseUrl,
        // Adicionar estas propriedades para depuração
        debug: true,
        storageKey: 'supabase.auth.token',
        storage: {
          getItem: (key) => {
            try {
              const item = localStorage.getItem(key);
              console.log(`[Auth Debug] getItem(${key}) =>`, item ? "valor existente" : "null");
              return item;
            } catch (error) {
              console.error(`[Auth Debug] Erro em getItem(${key}):`, error);
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              console.log(`[Auth Debug] setItem(${key}) =>`, value ? "definindo valor" : "null");
              localStorage.setItem(key, value);
            } catch (error) {
              console.error(`[Auth Debug] Erro em setItem(${key}):`, error);
            }
          },
          removeItem: (key) => {
            try {
              console.log(`[Auth Debug] removeItem(${key})`);
              localStorage.removeItem(key);
            } catch (error) {
              console.error(`[Auth Debug] Erro em removeItem(${key}):`, error);
            }
          }
        },
        onAuthStateChange: (event) => {
          console.log(`[Auth Debug] Evento de autenticação:`, event);
        }
      },
      // Ativar manipulação global de erros
      global: {
        headers: {
          'X-Client-Info': 'financeiro-control@1.0.0',
        },
      },
      // Aumentar o timeout para dar mais tempo para operações de autenticação
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
    
    console.log("Cliente Supabase inicializado com sucesso")
    return supabase
  } catch (error) {
    console.error("Erro ao inicializar cliente Supabase:", error)
    // Em vez de lançar um erro, podemos retornar um cliente mock para evitar travamento
    return createFallbackClient();
  }
}

// Cliente reserva para quando há falha na inicialização
function createFallbackClient() {
  console.warn("Usando cliente Supabase de fallback - funcionalidade limitada");
  
  // Mock básico do cliente Supabase
  return {
    auth: {
      signInWithPassword: async () => ({ data: null, error: new Error("Configuração Supabase indisponível") }),
      signUp: async () => ({ data: null, error: new Error("Configuração Supabase indisponível") }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async () => ({ data: null, error: new Error("Configuração Supabase indisponível") }),
      resetPasswordForEmail: async () => ({ error: new Error("Configuração Supabase indisponível") }),
      resend: async () => ({ error: new Error("Configuração Supabase indisponível") }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ data: [], error: null }) }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ eq: () => ({ data: null, error: null }) }),
      delete: () => ({ eq: () => ({ data: null, error: null }) }),
    }),
  } as any;
}

export function getSupabase() {
  if (!supabase) {
    return initSupabase();
  }
  return supabase
}

