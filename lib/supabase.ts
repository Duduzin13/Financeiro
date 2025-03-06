import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null

export function initSupabase() {
  if (supabase) return supabase

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables:")
    if (!supabaseUrl) console.error("- NEXT_PUBLIC_SUPABASE_URL is not set")
    if (!supabaseAnonKey) console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")
    throw new Error("Missing Supabase environment variables")
  }

  try {
    console.log("Initializing Supabase with URL:", supabaseUrl)
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log("Supabase client initialized successfully")
    return supabase
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    throw error
  }
}

export function getSupabase() {
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Call initSupabase() first.")
  }
  return supabase
}

