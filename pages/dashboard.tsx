"use client"

import { useState, useEffect } from "react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { supabaseService } from "@/services/supabaseService"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type Income = {
  id: string
  description: string
  amount: number
  category: string
  created_at: string
}

type Expense = {
  id: string
  description: string
  amount: number
  category: string
  is_essential: boolean
  created_at: string
}

type FinancialSummary = {
  totalIncome: number
  totalExpenses: number
  balance: number
  recentIncomes: Income[]
  recentExpenses: Expense[]
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentIncomes: [],
    recentExpenses: []
  })
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true)
    if (mounted && !loading && !user) {
      router.push("/")
    }
  }, [user, loading, router, mounted])

  useEffect(() => {
    if (user && mounted) {
      loadFinancialData()
    }
  }, [user, mounted])

  const loadFinancialData = async () => {
    setLoadingData(true);
    setLoadError(null);
    
    try {
      const [incomesData, expensesData] = await Promise.all([
        supabaseService.getIncomes(),
        supabaseService.getExpenses()
      ]);
      
      const incomes = incomesData || [];
      const expenses = expensesData || [];
      
      const totalIncome = incomes.reduce((acc, income) => acc + Number(income.amount), 0)
      const totalExpenses = expenses.reduce((acc, expense) => acc + Number(expense.amount), 0)
      const balance = totalIncome - totalExpenses
      
      // Ordenar por data e pegar os 3 mais recentes
      const recentIncomes = [...incomes]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
      
      const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
      
      setSummary({
        totalIncome,
        totalExpenses,
        balance,
        recentIncomes,
        recentExpenses
      })
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error)
      setLoadError("Não foi possível carregar os dados financeiros. Tente novamente mais tarde.");
    } finally {
      setLoadingData(false);
    }
  }

  if (!mounted || loading || !user) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Dashboard</h1>

        {loadError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {loadError}
            <button 
              onClick={() => loadFinancialData()} 
              className="ml-2 underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Resumo Financeiro */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">Resumo Financeiro</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Receitas (Mês Atual)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  R$ {summary.totalIncome.toFixed(2).replace('.', ',')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Despesas (Mês Atual)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  R$ {summary.totalExpenses.toFixed(2).replace('.', ',')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="col-span-2 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">Saldo (Mês Atual)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  R$ {summary.balance.toFixed(2).replace('.', ',')}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Entradas Recentes */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Entradas Recentes</h2>
            <Link href="/income" className="text-sm text-blue-600">
              Ver todas
            </Link>
          </div>
          
          {summary.recentIncomes.length > 0 ? (
            <div className="space-y-3">
              {summary.recentIncomes.map((income) => (
                <div key={income.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{income.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(income.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <p className="font-medium text-green-600">
                    R$ {income.amount.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma entrada registrada</p>
          )}
        </div>

        {/* Despesas Recentes */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Despesas Recentes</h2>
            <Link href="/expenses" className="text-sm text-blue-600">
              Ver todas
            </Link>
          </div>
          
          {summary.recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {summary.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(expense.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      R$ {expense.amount.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.is_essential ? 'Essencial' : 'Não Essencial'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma despesa registrada</p>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-3">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/income" className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Entrada
            </Link>
            <Link href="/expenses" className="bg-red-50 text-red-700 p-3 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar Despesa
            </Link>
            <Link href="/reports" className="bg-green-50 text-green-700 p-3 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Ver Relatórios
            </Link>
            <Link href="/settings" className="bg-purple-50 text-purple-700 p-3 rounded-lg text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configurações
            </Link>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
} 