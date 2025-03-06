"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabaseService } from "@/services/supabaseService"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
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

type MonthlyTotal = {
  month: string
  total_income: number
  total_expenses: number
  balance: number
}

type CategoryExpense = {
  name: string
  valor: number
  color: string
}

type TopExpense = {
  name: string
  valor: number
  categoria: string
}

export default function ReportsPage() {
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [period, setPeriod] = useState("3") // Default: últimos 3 meses
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Dados para gráficos e análises adicionais
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    essentialPercentage: 0,
    nonEssentialPercentage: 0,
    savingsPercentage: 0,
    emergencyFund: 0
  })
  
  // Dados fictícios para os gráficos e análises
  const [monthlyChartData, setMonthlyChartData] = useState([
    { name: 'Jan', receitas: 3000, despesas: 2500 },
    { name: 'Fev', receitas: 3200, despesas: 2800 },
    { name: 'Mar', receitas: 2800, despesas: 2300 },
    { name: 'Abr', receitas: 3500, despesas: 3000 },
    { name: 'Mai', receitas: 3700, despesas: 2900 },
    { name: 'Jun', receitas: 3300, despesas: 2700 },
  ])
  
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([
    { name: 'Moradia', valor: 1200, color: '#FF8042' },
    { name: 'Alimentação', valor: 800, color: '#00C49F' },
    { name: 'Transporte', valor: 500, color: '#FFBB28' },
    { name: 'Lazer', valor: 300, color: '#0088FE' },
    { name: 'Saúde', valor: 200, color: '#FF0000' },
  ])
  
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([
    { name: 'Aluguel', valor: 900, categoria: 'Moradia' },
    { name: 'Supermercado', valor: 600, categoria: 'Alimentação' },
    { name: 'Gasolina', valor: 300, categoria: 'Transporte' },
    { name: 'Restaurantes', valor: 250, categoria: 'Alimentação' },
    { name: 'Cinema', valor: 150, categoria: 'Lazer' },
  ])

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
  }, [user, period])

  const loadReportData = async () => {
    setIsLoading(true)
    try {
      // Idealmente, o supabaseService teria um método específico para obter dados de relatório
      // por período, mas por enquanto vamos usar os dados do dashboard
      const dashboardData = await supabaseService.getDashboardData()
      setMonthlyTotals(dashboardData.monthlyTotals || [])
      
      // Em uma implementação real, carregaríamos também os dados para os gráficos e análises adicionais
      // setMonthlyChartData(processedMonthlyData)
      // setCategoryData(processedCategoryData)
      // setTopExpenses(processedTopExpenses)
      
      // Cálculo do resumo financeiro
      if (dashboardData.monthlyTotals && dashboardData.monthlyTotals.length > 0) {
        const totalIncome = dashboardData.monthlyTotals.reduce((sum, month) => sum + month.total_income, 0)
        const totalExpenses = dashboardData.monthlyTotals.reduce((sum, month) => sum + month.total_expenses, 0)
        
        setFinancialSummary({
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          essentialPercentage: totalIncome > 0 ? (totalExpenses * 0.6 / totalIncome) * 100 : 0,
          nonEssentialPercentage: totalIncome > 0 ? (totalExpenses * 0.3 / totalIncome) * 100 : 0,
          savingsPercentage: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
          emergencyFund: totalExpenses * 6 // 6 meses de despesas
        })
      }
    } catch (error) {
      console.error("Erro ao carregar dados do relatório:", error)
      alert("Erro ao carregar dados. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}% da renda`
  }

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  const getStatusClass = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-gray-600"
  }

  if (!mounted || loading || !user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="flex-1 p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4">Relatórios</h1>
        
        <Tabs defaultValue="resumo" className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="analises">Análises</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumo" className="space-y-4">
            {/* Filtro de período - mantido da versão original */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Filtro</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Último mês</SelectItem>
                    <SelectItem value="3">Últimos 3 meses</SelectItem>
                    <SelectItem value="6">Últimos 6 meses</SelectItem>
                    <SelectItem value="12">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            {/* Resumo Financeiro */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total de Entradas</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(financialSummary.totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total de Despesas</span>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(financialSummary.totalExpenses)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Saldo</span>
                  <span className={`font-medium ${getStatusClass(financialSummary.balance)}`}>
                    {formatCurrency(financialSummary.balance)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Gastos */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Distribuição de Gastos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Essenciais</span>
                    <span>{formatPercentage(financialSummary.essentialPercentage)}</span>
                  </div>
                  <Progress value={financialSummary.essentialPercentage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Não Essenciais</span>
                    <span>{formatPercentage(financialSummary.nonEssentialPercentage)}</span>
                  </div>
                  <Progress value={financialSummary.nonEssentialPercentage} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Economia/Investimentos</span>
                    <span>{formatPercentage(financialSummary.savingsPercentage)}</span>
                  </div>
                  <Progress value={financialSummary.savingsPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Reserva de Emergência */}
            <Card>
              <CardHeader>
                <CardTitle>Reserva de Emergência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-1">Valor ideal (6 meses de despesas)</p>
                <p className="text-xl font-medium">{formatCurrency(financialSummary.emergencyFund)}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="graficos" className="space-y-4">
            {/* Receitas vs Despesas (Gráfico de Linhas) */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Receitas vs Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyChartData}
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
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
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
          
          <TabsContent value="analises" className="space-y-4">
            {/* Resumo Mensal - mantido da versão original e melhorado */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Resumo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center py-4">Carregando dados...</p>
                ) : monthlyTotals.length > 0 ? (
                  <div className="space-y-4">
                    {monthlyTotals.map((item, index) => (
                      <div key={index} className="border-b pb-3 last:border-0">
                        <h3 className="font-medium mb-2">{formatMonth(item.month)}</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm text-gray-500">Receitas</p>
                            <p className="text-green-600">{formatCurrency(item.total_income)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Despesas</p>
                            <p className="text-red-600">{formatCurrency(item.total_expenses)}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Saldo</p>
                          <p className={getStatusClass(item.balance)}>
                            {formatCurrency(item.balance)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    Nenhum dado financeiro disponível para o período selecionado.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Maiores Despesas */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Maiores Despesas</CardTitle>
              </CardHeader>
              <CardContent>
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
              <CardHeader>
                <CardTitle>Dicas Financeiras</CardTitle>
              </CardHeader>
              <CardContent>
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