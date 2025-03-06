"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabaseService } from "@/services/supabaseService"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { initSupabase } from "@/lib/supabase"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router, mounted])

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      alert("Erro ao fazer logout. Tente novamente.")
    }
  }

  const handleDeleteProfile = async () => {
    try {
      setIsDeleting(true)
      await supabaseService.deleteUserProfile()
      alert("Seu perfil e todos os seus dados foram excluídos com sucesso.")
      router.push("/login")
    } catch (error: any) {
      console.error("Erro ao excluir perfil:", error)
      alert(error.message || "Erro ao excluir perfil. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!mounted || loading || !user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Configurações</h1>

        <div className="space-y-6">
          {/* Perfil */}
          <Card className="dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Perfil</CardTitle>
              <CardDescription className="dark:text-gray-400">Informações da sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">E-mail</p>
                  <p className="dark:text-white">{user.email}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleSignOut} className="w-full dark:text-white dark:border-gray-600">
                Sair da conta
              </Button>
            </CardFooter>
          </Card>

          {/* Preferências */}
          <Card className="dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Preferências</CardTitle>
              <CardDescription className="dark:text-gray-400">Personalize sua experiência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="font-medium dark:text-white">Modo escuro</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tema escuro para a aplicação</p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={theme === "dark"}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zona de Perigo */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Zona de Perigo</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Ações irreversíveis para sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-base font-medium mb-2 text-red-600 dark:text-red-400">
                  Apagar Perfil
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Esta ação irá excluir permanentemente sua conta e todos os seus dados. 
                  Esta ação não pode ser desfeita.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                    >
                      Apagar Perfil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-white">
                        Tem certeza?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-gray-400">
                        Esta ação não pode ser desfeita. Isso irá excluir permanentemente sua conta
                        e remover todos os seus dados dos nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteProfile}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                      >
                        {isDeleting ? "Excluindo..." : "Sim, apagar meu perfil"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Sobre */}
          <Card className="dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-center text-gray-500 dark:text-gray-400">Controle Financeiro</p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">Versão 1.0.0</p>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  © 2023 Todos os direitos reservados
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
} 