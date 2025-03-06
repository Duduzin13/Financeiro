"use client"

import type React from "react"
import { useAuth } from "./auth-provider"

interface ErrorDisplayProps {
  error: string
}

export function ErrorDisplay() {
  const { error } = useAuth()
  
  if (!error) return null
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-sm w-full bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-bold text-red-600 mb-4">Erro</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    </div>
  )
}
