"use client"

import type React from "react"

import { useState } from "react"
import { initSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  
  const supabase = initSupabase()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })
      
      if (error) throw error
      
      setMessage("Email de redefinição de senha enviado. Verifique sua caixa de entrada.")
    } catch (error) {
      console.error("Error sending password reset email:", error)
      setMessage("Erro ao enviar email de redefinição de senha. Tente novamente.")
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Redefinir Senha</CardTitle>
        <CardDescription>Enviaremos um link para redefinir sua senha</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" className="w-full">
            Enviar Link de Redefinição
          </Button>
        </form>
        {message && <p className="mt-4 text-sm text-center">{message}</p>}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-center w-full">
          <a href="/login" className="text-blue-500 hover:underline">
            Voltar para o login
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}

export default ResetPasswordForm; 