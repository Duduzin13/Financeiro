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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"

type Expense = {
  id: string
  description: string
  amount: number
  category: string
  is_essential: boolean
  created_at: string
}

type Category = {
  id: string
  name: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [isEssential, setIsEssential] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router, mounted])

  useEffect(() => {
    if (user) {
      loadExpenses()
      loadCategories()
    }
  }, [user])

  const loadExpenses = async () => {
    setIsLoading(true)
    try {
      const data = await supabaseService.getExpenses()
      setExpenses(data as Expense[])
    } catch (error) {
      console.error("Erro ao carregar despesas:", error)
      alert("Erro ao carregar despesas. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await supabaseService.getCategories('expense')
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
      if (editMode && editExpenseId) {
        await supabaseService.updateExpense(editExpenseId, {
          description: description.trim(),
          amount: parseFloat(amount),
          category: category === "sem_categoria" ? undefined : category,
          is_essential: isEssential
        })
        alert("Despesa atualizada com sucesso!")
      } else {
        await supabaseService.createExpense({
          description: description.trim(),
          amount: parseFloat(amount),
          category: category === "sem_categoria" ? undefined : category,
          is_essential: isEssential
        })
        alert("Despesa registrada com sucesso!")
      }

      resetForm()
      loadExpenses()
    } catch (error) {
      console.error("Erro ao salvar despesa:", error)
      alert("Erro ao salvar despesa. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setDescription(expense.description)
    setAmount(expense.amount.toString())
    setCategory(expense.category || "sem_categoria")
    setIsEssential(expense.is_essential)
    
    setEditMode(true)
    setEditExpenseId(expense.id)
    
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setCategory("")
    setIsEssential(false)
    setEditMode(false)
    setEditExpenseId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return

    try {
      await supabaseService.deleteExpense(id)
      loadExpenses()
      alert("Despesa excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir despesa:", error)
      alert("Erro ao excluir despesa. Tente novamente.")
    }
  }

  if (!mounted || loading || !user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Despesas</h1>

        {/* Formulário para Adicionar/Editar Despesa */}
        <Card className="mb-6 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">{editMode ? "Editar Despesa" : "Nova Despesa"}</CardTitle>
            <CardDescription className="dark:text-gray-400">
              {editMode ? "Atualize os dados da despesa" : "Registre uma nova despesa"}
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
                  id="is-essential" 
                  checked={isEssential} 
                  onCheckedChange={setIsEssential}
                  disabled={isSubmitting}
                />
                <Label htmlFor="is-essential" className="dark:text-white">Despesa essencial</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting 
                    ? "Salvando..." 
                    : (editMode ? "Atualizar Despesa" : "Registrar Despesa")}
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

        {/* Lista de Despesas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-white">Despesas Recentes</h2>
            <Link href="/categories" className="text-sm text-blue-600 dark:text-blue-400">
              Gerenciar Categorias
            </Link>
          </div>

          {isLoading ? (
            <p className="text-center py-4 dark:text-gray-300">Carregando...</p>
          ) : expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <Card key={expense.id} className="dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium dark:text-white">{expense.description}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {expense.category && (
                            <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded mr-2">
                              {expense.category}
                            </span>
                          )}
                          <span className={`inline-block text-xs px-2 py-1 rounded mr-2 ${
                            expense.is_essential 
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" 
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}>
                            {expense.is_essential ? "Essencial" : "Não essencial"}
                          </span>
                          {new Date(expense.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600 dark:text-red-400">
                          R$ {expense.amount.toFixed(2).replace(".", ",")}
                        </p>
                        <div className="flex space-x-2 justify-end mt-1">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
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
              Nenhuma despesa registrada. Comece adicionando uma despesa acima.
            </p>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
} 