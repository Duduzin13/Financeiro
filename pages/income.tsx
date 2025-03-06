"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabaseService } from "@/services/supabaseService"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type Income = {
  id: string
  description: string
  amount: number
  category: string
  created_at: string
  is_recurrent: boolean
}

type Category = {
  id: string
  name: string
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editIncomeId, setEditIncomeId] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isRecurrent, setIsRecurrent] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router, mounted])

  useEffect(() => {
    if (user) {
      loadIncomes()
      loadCategories()
    }
  }, [user])

  const loadIncomes = async () => {
    setIsLoading(true)
    try {
      const data = await supabaseService.getIncomes()
      setIncomes(data as Income[])
    } catch (error) {
      console.error("Erro ao carregar receitas:", error)
      if (error instanceof Error) {
        console.error("Detalhes do erro:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
      }
      alert("Erro ao carregar receitas. Verifique o console para mais detalhes.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await supabaseService.getCategories('income')
      setCategories(data as Category[])
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    setIsSubmitting(true)
    try {
      if (editMode && editIncomeId) {
        await supabaseService.updateIncome(editIncomeId, {
          description: description.trim(),
          amount: parseFloat(amount),
          category: category === "sem_categoria" ? undefined : category,
          is_recurrent: isRecurrent
        })
        alert("Receita atualizada com sucesso!")
      } else {
        await supabaseService.createIncome({
          description: description.trim(),
          amount: parseFloat(amount),
          category: category === "sem_categoria" ? undefined : category,
          is_recurrent: isRecurrent
        })
        alert("Receita registrada com sucesso!")
      }

      resetForm()
      loadIncomes()
    } catch (error) {
      console.error("Erro ao salvar receita:", error)
      if (error instanceof Error) {
        console.error("Detalhes do erro:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
      }
      alert("Erro ao salvar receita. Verifique o console para mais detalhes.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (income: Income) => {
    setDescription(income.description)
    setAmount(income.amount.toString())
    setCategory(income.category || "sem_categoria")
    setIsRecurrent(income.is_recurrent)
    
    setEditMode(true)
    setEditIncomeId(income.id)
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setCategory("")
    setEditMode(false)
    setEditIncomeId(null)
    setIsRecurrent(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return

    try {
      await supabaseService.deleteIncome(id)
      loadIncomes()
      alert("Receita excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir receita:", error)
      alert("Erro ao excluir receita. Tente novamente.")
    }
  }

  if (!mounted || loading || !user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Receitas</h1>

        {/* Formulário para Adicionar/Editar Receita */}
        <Card className="mb-6 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{editMode ? "Editar Receita" : "Nova Receita"}</CardTitle>
            <CardDescription className="dark:text-gray-400">
              {editMode ? "Atualize os dados da receita" : "Registre uma nova receita"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Descrição"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Valor (R$)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
                  <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue placeholder="Categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="sem_categoria" className="dark:text-white">Sem categoria</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name} className="dark:text-white">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-recurrent"
                  checked={isRecurrent}
                  onCheckedChange={setIsRecurrent}
                  disabled={isSubmitting}
                />
                <Label htmlFor="is-recurrent" className="dark:text-white">Receita recorrente</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Salvando..."
                    : (editMode ? "Atualizar Receita" : "Registrar Receita")}
                </Button>

                {editMode && (
                  <Button type="button" variant="outline" onClick={resetForm} className="dark:border-gray-700 dark:text-gray-200">
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Receitas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-white">Receitas Recentes</h2>
            <Link href="/categories" className="text-sm text-blue-600 dark:text-blue-400">
              Gerenciar Categorias
            </Link>
          </div>

          {isLoading ? (
            <p className="text-center py-4 dark:text-gray-300">Carregando...</p>
          ) : incomes.length > 0 ? (
            <div className="space-y-3">
              {incomes.map((income) => (
                <Card key={income.id} className="dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium dark:text-white">{income.description}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {income.category && (
                            <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-1 rounded mr-2">
                              {income.category}
                            </span>
                          )}
                          <span className={`inline-block text-xs px-2 py-1 rounded mr-2 ${
                            income.is_recurrent 
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}>
                            {income.is_recurrent ? "Recorrente" : "Não recorrente"}
                          </span>
                          {new Date(income.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          R$ {income.amount.toFixed(2).replace(".", ",")}
                        </p>
                        <div className="flex space-x-2 justify-end mt-1">
                          <button
                            onClick={() => handleEdit(income)}
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(income.id)}
                            className="text-xs text-red-600 hover:underline dark:text-red-400"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              Nenhuma receita registrada. Comece adicionando uma receita acima.
            </p>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
} 