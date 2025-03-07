"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { initSupabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [signupSuccess, setSignupSuccess] = useState(false)
  const router = useRouter()

  const handleSignUp = async () => {
    // Validação
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Por favor, preencha todos os campos")
      return
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem")
      return
    }
    
    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres")
      return
    }
    
    setErrorMessage("")
    setSignupSuccess(false)
    setIsLoading(true)
    
    try {
      console.log("Iniciando cadastro com email:", email);
      const supabase = initSupabase()
      
      // Determinar a URL base para redirecionamentos
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin
        : 'https://financeiro-control.netlify.app';
      
      // Configurar opções para o cadastro
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name
          },
          // Sem confirmação de email para ambiente de desenvolvimento/teste
          emailRedirectTo: `${baseUrl}/dashboard`,
          // Se estiver rodando localmente, podemos auto-confirmar o email
          // Em produção isso deve ser falso para manter a segurança
          emailVerification: {
            redirectTo: `${baseUrl}/dashboard`
          }
        }
      })
      
      console.log("Resposta do cadastro:", data);
      
      if (error) {
        console.error("Erro ao criar conta:", error);
        
        // Mensagens de erro específicas
        if (error.message.includes("already registered")) {
          setErrorMessage("Este email já está cadastrado. Tente fazer login.");
        } else if (error.message.includes("Password should be")) {
          setErrorMessage("A senha não atende aos requisitos mínimos de segurança.");
        } else if (error.message.includes("rate limit")) {
          setErrorMessage("Muitas tentativas. Aguarde um momento e tente novamente.");
        } else {
          setErrorMessage(error.message || "Erro ao criar conta. Tente novamente.");
        }
        return;
      }
      
      // Verificar se o usuário foi criado
      if (!data?.user) {
        setErrorMessage("Não foi possível criar a conta. Tente novamente.");
        return;
      }
      
      // Verificar se é necessário confirmar o email
      if (data.user.identities && data.user.identities.length > 0) {
        const identity = data.user.identities[0];
        // Se o identity.identity_data.email_confirmed for true, redirecionar para dashboard
        if (identity.identity_data?.email_confirmed === true) {
          // Email já está confirmado, podemos redirecionar para o dashboard
          console.log("Email já confirmado, redirecionando para dashboard");
          router.push("/dashboard");
          return;
        }
      }
      
      // Caso contrário, mostrar a mensagem de sucesso padrão
      console.log("Cadastro realizado com sucesso, aguardando confirmação de email");
      setSignupSuccess(true);
    } catch (error: any) {
      console.error("Erro ao criar conta:", error)
      setErrorMessage(error.message || "Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setErrorMessage("")
    
    try {
      console.log("Iniciando criação de conta com Google")
      const supabase = initSupabase()
      
      // Determinar a URL de redirecionamento baseada no ambiente
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin
        : 'https://financeiro-control.netlify.app';
      
      // Usar /auth/callback em vez de /dashboard para o redirecionamento
      const redirectTo = `${baseUrl}/dashboard`;
      
      console.log("URL de redirecionamento:", redirectTo);
      
      // Voltamos a usar a API do Supabase, mas com configurações melhoradas
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            // Forçar re-consentimento para evitar problemas de sessão
            prompt: 'consent',
            // Escopos adicionais para garantir acesso ao email
            access_type: 'offline'
            // Removemos o redirect_uri personalizado para evitar conflitos
          }
        }
      })
      
      if (error) {
        console.error("Erro na API do OAuth:", error);
        setErrorMessage("Erro ao iniciar cadastro com Google: " + error.message);
        return;
      }
      
      if (!data?.url) {
        console.error("URL de autorização não retornada");
        setErrorMessage("Erro ao iniciar fluxo de autenticação com Google. Tente novamente.");
        return;
      }
      
      console.log("Redirecionando para URL de autenticação:", data.url);
      
      // Redirecionar para o URL fornecido pelo Supabase
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error("Erro ao criar conta com Google:", error)
      setErrorMessage("Erro ao criar conta com Google: " + error.message)
      setIsLoading(false)
    }
  }

  // Se o cadastro foi bem-sucedido, mostra a mensagem de sucesso
  if (signupSuccess) {
    return (
      <Card className="w-[350px] dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold dark:text-white">Conta Criada!</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Seu cadastro foi realizado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700">
            <AlertDescription className="text-green-800 dark:text-green-200">
              <p>Enviamos um link de confirmação para o email:</p>
              <p className="font-semibold mt-1">{email}</p>
              <p className="mt-2">Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.</p>
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button className="w-full" onClick={() => router.push("/login")}>
              Ir para Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-[350px] dark:border-gray-700 dark:bg-gray-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold dark:text-white">Criar Conta</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Escolha como deseja criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="google" className="w-full">
          
          
          <TabsContent value="google">
            <Button 
              className="w-full" 
              onClick={handleGoogleSignup}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Processando..." : "Cadastrar com Google"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Fazer login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

export default SignUpForm; 
