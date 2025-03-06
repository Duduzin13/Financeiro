"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabaseService } from "@/services/supabaseService"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("resumo")
  const [financialData, setFinancialData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    essentialPercentage: 0,
    nonEssentialPercentage: 0,
    savingsPercentage: 0,
    emergencyFund: 0
  })
  
  // Dados fictícios para os gráficos
  const [monthlyData, setMonthlyData] = useState([
    { name: 'Jan', receitas: 3000, despesas: 2500 },
    { name: 'Fev', receitas: 3200, despesas: 2800 },
    { name: 'Mar', receitas: 2800, despesas: 2300 },
    { name: 'Abr', receitas: 3500, despesas: 3000 },
    { name: 'Mai', receitas: 3700, despesas: 2900 },
    { name: 'Jun', receitas: 3300, despesas: 2700 },
  ])
  
  const [categoryData, setCategoryData] = useState([
    { name: 'Moradia', valor: 1200, color: '#FF8042' },
    { name: 'Alimentação', valor: 800, color: '#00C49F' },
    { name: 'Transporte', valor: 500, color: '#FFBB28' },
    { name: 'Lazer', valor: 300, color: '#0088FE' },
    { name: 'Saúde', valor: 200, color: '#FF0000' },
  ])
  
  const [topExpenses, setTopExpenses] = useState([
    { name: 'Aluguel', valor: 900, categoria: 'Moradia' },
    { name: 'Supermercado', valor: 600, categoria: 'Alimentação' },
    { name: 'Gasolina', valor: 300, categoria: 'Transporte' },
    { name: 'Restaurantes', valor: 250, categoria: 'Alimentação' },
    { name: 'Cinema', valor: 150, categoria: 'Lazer' },
  ])
  
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
      loadReportData()
    }
  }, [user])

  const loadReportData = async () => {
    setIsLoading(true)
    try {
      // Aqui você carregaria os dados reais da API
      // Por enquanto, usaremos dados fictícios como na imagem
      // Dados reais seriam carregados com algo como:
      // const data = await supabaseService.getFinancialReportData(userId)
      
      setFinancialData({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        essentialPercentage: 0,
        nonEssentialPercentage: 0,
        savingsPercentage: 0,
        emergencyFund: 0
      })
      
      // Em uma implementação real, você também carregaria os dados para os gráficos
      // setMonthlyData(data.monthlyData)
      // setCategoryData(data.categoryData)
      // setTopExpenses(data.topExpenses)
    } catch (error) {
      console.error("Erro ao carregar dados do relatório:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`
  }

  if (!mounted || loading || !user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
        
        <Tabs defaultValue="resumo" className="mb-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumo" className="space-y-4">
            {/* Resumo Financeiro */}
            <Card className="mb-4">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">Resumo Financeiro</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de Entradas</span>
                    <span className="text-green-600 font-medium">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total de Despesas</span>
                    <span className="text-red-600 font-medium">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo</span>
                    <span className="text-green-600 font-medium">R$ 0,00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Gastos */}
            <Card className="mb-4">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">Distribuição de Gastos</h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Essenciais</span>
                      <span>0.0% da renda</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Não Essenciais</span>
                      <span>0.0% da renda</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Economia/Investimentos</span>
                      <span>0.0% da renda</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reserva de Emergência */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">Reserva de Emergência</h2>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor ideal (6 meses de despesas)</p>
                  <p className="text-xl font-medium">R$ 0,00</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="graficos" className="space-y-4">
            {/* Receitas vs Despesas (Gráfico de Linhas) */}
            <Card className="mb-4">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">Receitas vs Despesas</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="receitas" stroke="#4ade80" activeDot={{ r: 8 }} name="Receitas" />
                      <Line type="monotone" dataKey="despesas" stroke="#f87171" name="Despesas" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Distribuição por Categoria (Gráfico de Pizza) */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">Distribuição por Categoria</h2>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="valor"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="detalhes" className="space-y-4">
            {/* Maiores Despesas */}
            <Card className="mb-4">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">Maiores Despesas do Mês</h2>
                <div className="space-y-3">
                  {topExpenses.map((expense, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h3 className="font-medium">{expense.name}</h3>
                        <p className="text-sm text-gray-500">{expense.categoria}</p>
                      </div>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(expense.valor)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Dicas Financeiras */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">Dicas Financeiras</h2>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <h3 className="font-medium text-blue-700">Crie uma reserva de emergência</h3>
                    <p className="text-sm text-blue-600">
                      Tente economizar o equivalente a 6 meses de despesas para emergências.
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md border border-green-100">
                    <h3 className="font-medium text-green-700">Regra 50-30-20</h3>
                    <p className="text-sm text-green-600">
                      Destine 50% da sua renda para necessidades, 30% para desejos e 20% para poupança.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
                    <h3 className="font-medium text-amber-700">Revise seus gastos</h3>
                    <p className="text-sm text-amber-600">
                      Analise suas despesas regularmente para identificar oportunidades de economia.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  )
} 