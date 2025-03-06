import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { setupAuthRedirect } from '@/lib/auth-redirect'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  // Configurar redirecionamento de autenticação
  useEffect(() => {
    setupAuthRedirect();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  )
} 