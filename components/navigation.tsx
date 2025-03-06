"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      const { error } = await getSupabase().auth.signOut()
      if (error) {
        console.error('Erro ao sair:', error)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Erro ao processar logout:', error)
    }
  }

  return (
    <nav className="bg-white shadow-lg mb-4">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/categories"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/categories'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Categorias
            </Link>
            <Link
              href="/transactions"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/transactions'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Transações
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}
