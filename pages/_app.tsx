import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { setupAuthRedirect } from '@/lib/auth-redirect'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    console.log('[App] Inicializando App e configurando redirecionamento auth...');
    
    // Verifica se a URL contém token de autenticação para processar antes de renderizar
    const hasAuthTokens = typeof window !== 'undefined' && 
      window.location.hash && 
      window.location.hash.includes('access_token');
      
    if (hasAuthTokens) {
      console.log('[App] Detectado token de autenticação na URL, processando antes de renderizar componentes');
    }
    
    // Executar setupAuthRedirect apenas no cliente
    if (typeof window !== 'undefined') {
      try {
        setupAuthRedirect();
      } catch (error) {
        console.error('[App] Erro ao configurar redirecionamento:', error);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  )
} 