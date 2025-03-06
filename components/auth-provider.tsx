"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { initSupabase } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isConfigured: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  isConfigured: false,
  signOut: async () => {}
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  // Função de logout
  const signOut = async () => {
    try {
      if (!session) {
        console.warn("Tentativa de logout sem sessão ativa.");
        return;
      }
      const supabase = initSupabase()
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        console.error("Erro ao fazer logout:", signOutError)
        throw signOutError
      }
      
      // Limpar o estado mesmo em caso de erro para garantir que o usuário seja desconectado na UI
      setUser(null)
      setSession(null)

      // Limpar qualquer estado de redirecionamento que possa estar armazenado
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_redirect_processed');
      }
    } catch (error) {
      console.error("Erro ao processar logout:", error)
      throw error
    }
  }

  useEffect(() => {
    setMounted(true)
    
    async function initializeAuth() {
      try {
        console.log("Inicializando Supabase no AuthProvider")
        const supabase = initSupabase()

        // Verificar se temos ambiente configurado corretamente
        if (typeof window !== 'undefined') {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          setIsConfigured(!!(url && key));
          
          if (!url || !key) {
            console.warn("Variáveis de ambiente do Supabase não estão definidas. Funcionalidade de autenticação pode ser limitada.");
          }
        }

        console.log("Buscando sessão inicial")
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.warn("Erro ao obter sessão inicial:", sessionError);
        } else {
          console.log("Sessão inicial obtida:", initialSession ? "Autenticado" : "Não autenticado");
        }
        
        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        console.log("Configurando listener para mudanças de autenticação")
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
          console.log("Evento de mudança de estado de autenticação:", _event);
          setSession(newSession)
          setUser(newSession?.user ?? null)
        })

        return () => {
          console.log("Limpando inscrição de auth state change");
          subscription.unsubscribe()
        }
      } catch (e) {
        console.error("Erro no AuthProvider:", e)
        setError(e instanceof Error ? e.message : "Ocorreu um erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Não renderize nada até que o componente esteja montado no cliente
  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, error, isConfigured, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
