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
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true, error: null })

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    async function initializeAuth() {
      try {
        console.log("Inicializando Supabase no AuthProvider")
        const supabase = initSupabase()

        console.log("Buscando sessão inicial")
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)

        console.log("Configurando listener para mudanças de autenticação")
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
        })

        return () => {
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

  return <AuthContext.Provider value={{ user, session, loading, error }}>{children}</AuthContext.Provider>
}
