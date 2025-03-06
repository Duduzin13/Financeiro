"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabaseService } from "@/services/supabaseService"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type MonthlyTotal = {
  month: string
  total_income: number
  total_expenses: number
  balance: number
}

export default function ReportsPage() {
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [period, setPeriod] = useState("3") // Default: últimos 3 meses
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
  }, [user, period])

  const loadReportData = async () => {
    setIsLoading(true)
    try {
      // Idealmente, o supabaseService teria um método específico para obter dados de relatório
      // por período, mas por enquanto vamos usar os dados do dashboard
      const dashboardData = await supabaseService.getDashboardData()
      setMonthlyTotals(dashboardData.monthlyTotals || [])
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

        <Card className="mb-6">
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

        {isLoading ? (
          <p className="text-center py-4">Carregando dados...</p>
        ) : monthlyTotals.length > 0 ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Mensal</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Gráfico ou Resumo Geral */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Receitas</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(
                        monthlyTotals.reduce((sum, item) => sum + item.total_income, 0)
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Despesas</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(
                        monthlyTotals.reduce((sum, item) => sum + item.total_expenses, 0)
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">Saldo Final</p>
                    <p className={`text-lg font-bold ${getStatusClass(
                      monthlyTotals.reduce((sum, item) => sum + item.balance, 0)
                    )}`}>
                      {formatCurrency(
                        monthlyTotals.reduce((sum, item) => sum + item.balance, 0)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500">
            Nenhum dado financeiro disponível para o período selecionado.
          </p>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
} 