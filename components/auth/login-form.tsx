"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { initSupabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, isConfigured, loading: authLoading } = useAuth()
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false)
  const [isInvalidCredentials, setIsInvalidCredentials] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[LoginForm] Verificando autenticação...');
      
      if (!authLoading && user) {
        console.log('[LoginForm] Usuário já autenticado, redirecionando para dashboard');
        router.push("/dashboard");
      }
    };
    
    checkAuth();
  }, [user, authLoading, router]);

  const handleDebugClick = () => {
    if (!showDebugInfo) {
      const debugCounter = parseInt(localStorage.getItem('debug_counter') || '0') + 1;
      localStorage.setItem('debug_counter', debugCounter.toString());
      
      if (debugCounter >= 5) {
        setShowDebugInfo(true);
        localStorage.setItem('debug_counter', '0');
      }
    }
  };

  if (!isConfigured) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
        <h2 className="text-lg font-semibold text-yellow-700 mb-2">Configuração Incompleta</h2>
        <p className="text-yellow-600 mb-2">
          O sistema de autenticação não está configurado corretamente. As variáveis de ambiente do Supabase não foram encontradas.
        </p>
        <p className="text-sm text-yellow-500">
          Administrador: Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no painel do Netlify.
        </p>
      </div>
    )
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, preencha todos os campos")
      return
    }
    
    setError(null)
    setIsEmailNotConfirmed(false)
    setIsInvalidCredentials(false)
    setLoading(true)
    
    try {
      const supabase = initSupabase()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setIsEmailNotConfirmed(true)
          return
        } 
        else if (error.message.includes("Invalid login credentials")) {
          setIsInvalidCredentials(true)
          return
        }
        // Para outros erros desconhecidos
        setError(error.message || "Erro ao fazer login. Tente novamente.")
        return
      }
      
      router.push("/dashboard")
    } catch (error: any) {
      // Erros inesperados que podem ocorrer fora da API de autenticação
      console.error("Erro inesperado ao fazer login:", error)
      setError("Ocorreu um erro inesperado. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmationEmail = async () => {
    if (!email) {
      setError("Por favor, insira seu email para reenviar a confirmação")
      return
    }

    setIsResendingEmail(true)
    try {
      const supabase = initSupabase()
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      alert("Email de confirmação reenviado. Por favor, verifique sua caixa de entrada.")
    } catch (error: any) {
      console.error("Erro ao reenviar email de confirmação:", error)
      setError("Erro ao reenviar email. " + error.message)
    } finally {
      setIsResendingEmail(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError("")
    setIsEmailNotConfirmed(false)
    setIsInvalidCredentials(false)
    
    try {
      console.log("Iniciando login com Google")
      const supabase = initSupabase()
      
      // Determinar a URL de redirecionamento baseada no ambiente
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin
        : 'https://financeiro-control.netlify.app';
      
      const redirectTo = `${baseUrl}/dashboard`;
      
      console.log("URL de redirecionamento:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        }
      })
      
      if (error) {
        console.error("Erro ao fazer login com Google:", error);
        setError("Erro ao fazer login com Google: " + error.message)
        return
      }
      
      console.log("Login com Google processado, redirecionando...", data);
    } catch (error: any) {
      console.error("Erro ao fazer login com Google:", error)
      setError("Erro ao fazer login com Google. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-[350px] dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold dark:text-white" onClick={handleDebugClick}>
          Entrar
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Entre com seu e-mail e senha para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Área de informações de depuração - visível após 5 cliques no título */}
        {showDebugInfo && (
          <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-xs">
            <h4 className="font-semibold mb-1">Informações de depuração:</h4>
            <div className="space-y-1 max-h-32 overflow-auto">
              <p>Usuário: {user ? 'Autenticado' : 'Não autenticado'}</p>
              <p>Autenticação: {authLoading ? 'Carregando...' : 'Concluída'}</p>
              <p>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p>Supabase Configurado: {isConfigured ? 'Sim' : 'Não'}</p>
              <details>
                <summary>Usuário detalhado</summary>
                <pre className="whitespace-pre-wrap">
                  {user ? JSON.stringify(user, null, 2) : 'null'}
                </pre>
              </details>
              <button 
                onClick={() => sessionStorage.clear()} 
                className="text-xs bg-red-500 text-white px-2 py-0.5 rounded"
              >
                Limpar SessionStorage
              </button>
            </div>
          </div>
        )}

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 dark:bg-gray-700">
            <TabsTrigger value="email" className="dark:data-[state=active]:bg-gray-600 dark:text-white">
              Email
            </TabsTrigger>
            <TabsTrigger value="google" className="dark:data-[state=active]:bg-gray-600 dark:text-white">
              Google
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="dark:text-white">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nome@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="dark:text-white">Senha</Label>
                <Link href="#" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            
            {error && !isEmailNotConfirmed && !isInvalidCredentials && (
              <div className="text-sm text-red-500 dark:text-red-400">
                {error}
              </div>
            )}
            
            {isEmailNotConfirmed && (
              <Alert className="bg-amber-50 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700">
                <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                  <p>Email não confirmado. Por favor verifique sua caixa de entrada.</p>
                  <Button 
                    variant="link" 
                    onClick={handleResendConfirmationEmail}
                    disabled={isResendingEmail}
                    className="p-0 h-auto text-amber-700 dark:text-amber-300 mt-1"
                  >
                    {isResendingEmail ? "Reenviando..." : "Reenviar email de confirmação"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {isInvalidCredentials && (
              <Alert className="bg-red-50 border-red-300 dark:bg-red-900/30 dark:border-red-700">
                <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                  <p>Email ou senha incorretos. Verifique suas credenciais e tente novamente.</p>
                  <p className="mt-1">
                    Não tem uma conta?{" "}
                    <Link href="/signup" className="text-red-700 hover:underline dark:text-red-300">
                      Criar conta
                    </Link>
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              className="w-full" 
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </TabsContent>
          
          <TabsContent value="google">
            <Button 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
            >
              {loading ? "Processando..." : "Entrar com Google"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Não tem uma conta?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
            Criar conta
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default LoginForm;

