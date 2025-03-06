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
    
    setErrorMessage("")
    setSignupSuccess(false)
    setIsLoading(true)
    
    try {
      const supabase = initSupabase()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })
      
      if (error) throw error
      
      // Sucesso
      setSignupSuccess(true)
      // Não redirecionar - esperar confirmação do email
      // router.push("/login")
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
      
      const redirectTo = `${baseUrl}/dashboard`;
      
      console.log("URL de redirecionamento:", redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
        }
      })
      
      if (error) {
        console.error("Erro ao criar conta com Google:", error);
        setErrorMessage("Erro ao criar conta com Google: " + error.message)
        return
      }
      
      console.log("Criação de conta com Google processada, redirecionando...", data);
    } catch (error: any) {
      console.error("Erro ao criar conta com Google:", error)
      setErrorMessage("Erro ao criar conta com Google: " + error.message)
    } finally {
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
              <Label htmlFor="name" className="dark:text-white">Nome</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="Seu nome completo" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
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
              <Label htmlFor="password" className="dark:text-white">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Crie uma senha forte"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password" className="dark:text-white">Confirmar Senha</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            {errorMessage && (
              <div className="text-sm text-red-500 dark:text-red-400">
                {errorMessage}
              </div>
            )}
            <Button 
              className="w-full" 
              onClick={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </TabsContent>
          
          <TabsContent value="google">
            <Button 
              className="w-full" 
              onClick={handleGoogleSignup}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? "Processando..." : "Criar Conta com Google"}
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