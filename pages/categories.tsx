"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabaseService } from "@/services/supabaseService"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"

type Category = {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
  created_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryName, setCategoryName] = useState("")
  const [categoryType, setCategoryType] = useState<'income' | 'expense' | 'both'>('both')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    setMounted(true)
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router, mounted])

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user, activeTab])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      let data: Category[];
      
      if (activeTab === "income") {
        data = await supabaseService.getCategories('income');
      } else if (activeTab === "expense") {
        data = await supabaseService.getCategories('expense');
      } else {
        data = await supabaseService.getCategories();
      }
      
      setCategories(data)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      alert("Erro ao carregar categorias. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setIsSubmitting(true)
    try {
      if (editMode && editCategoryId) {
        await supabaseService.updateCategory(editCategoryId, {
          name: categoryName.trim(),
          type: categoryType
        })
        alert("Categoria atualizada com sucesso!")
      } else {
        await supabaseService.createCategory({
          name: categoryName.trim(),
          type: categoryType
        })
        alert("Categoria criada com sucesso!")
      }

      setCategoryName("")
      setCategoryType('both')
      setEditMode(false)
      setEditCategoryId(null)
      loadCategories()
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      alert("Erro ao salvar categoria. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setCategoryName(category.name)
    setCategoryType(category.type)
    setEditMode(true)
    setEditCategoryId(category.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return
    
    try {
      await supabaseService.deleteCategory(id)
      loadCategories()
      alert("Categoria excluída com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      alert("Erro ao excluir categoria. Tente novamente.")
    }
  }

  const handleCancel = () => {
    setCategoryName("")
    setCategoryType('both')
    setEditMode(false)
    setEditCategoryId(null)
  }

  if (!mounted || loading || !user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-4 pb-24">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold dark:text-white">Categorias</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Voltar
          </Button>
        </div>

        {/* Formulário para Adicionar/Editar Categoria */}
        <Card className="mb-6 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">
              {editMode ? "Editar Categoria" : "Nova Categoria"}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              {editMode ? "Atualize os dados da categoria" : "Adicione uma nova categoria para organizar suas finanças"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name" className="dark:text-white">Nome da Categoria</Label>
                <Input
                  id="category-name"
                  placeholder="Ex: Alimentação, Transporte, Lazer..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category-type" className="dark:text-white">Tipo de Categoria</Label>
                <Select
                  value={categoryType}
                  onValueChange={(value) => setCategoryType(value as 'income' | 'expense' | 'both')}
                >
                  <SelectTrigger id="category-type" className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="expense" className="dark:text-white">Despesa</SelectItem>
                    <SelectItem value="income" className="dark:text-white">Receita</SelectItem>
                    <SelectItem value="both" className="dark:text-white">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting 
                    ? "Salvando..." 
                    : (editMode ? "Atualizar Categoria" : "Adicionar Categoria")}
                </Button>
                {editMode && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    className="dark:border-gray-700 dark:text-gray-300"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Categorias */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Suas Categorias</h2>
            {isLoading ? (
              <p className="text-center py-4 dark:text-gray-400">Carregando categorias...</p>
            ) : categories.length > 0 ? (
              <>
                <Tabs defaultValue="all" className="mb-4">
                  <TabsList className="dark:bg-gray-800">
                    <TabsTrigger value="all" className="dark:data-[state=active]:bg-gray-700 dark:text-white">Todas</TabsTrigger>
                    <TabsTrigger value="expense" className="dark:data-[state=active]:bg-gray-700 dark:text-white">Despesas</TabsTrigger>
                    <TabsTrigger value="income" className="dark:data-[state=active]:bg-gray-700 dark:text-white">Receitas</TabsTrigger>
                  </TabsList>
                  
                  {["all", "expense", "income", "both"].map((filter) => (
                    <TabsContent key={filter} value={filter} className="mt-4">
                      <div className="space-y-3">
                        {categories
                          .filter(cat => filter === "all" || cat.type === filter)
                          .map((category) => (
                            <Card key={category.id} className="dark:border-gray-700">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-medium dark:text-white">{category.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {category.type === "expense" 
                                        ? "Despesa" 
                                        : category.type === "income" 
                                          ? "Receita" 
                                          : "Despesa/Receita"}
                                    </p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => handleEdit(category)}
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      Editar
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                      onClick={() => handleDelete(category.id)}
                                    >
                                      Excluir
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </>
            ) : (
              <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                Nenhuma categoria criada. Comece adicionando categorias acima.
              </p>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
} 