import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { setupAuthRedirect } from '@/lib/auth-redirect'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Configurar redirecionamento de autenticação
  useEffect(() => {
    console.log('[App] Inicializando App e configurando redirecionamento auth...');
    
    // Verifica se a URL contém token de autenticação para processar antes de renderizar
    const hasAuthTokens = typeof window !== 'undefined' && 
      window.location.hash && 
      window.location.hash.includes('access_token');
      
    if (hasAuthTokens) {
      console.log('[App] Detectado token de autenticação na URL, processando antes de renderizar componentes');
    }
    
    // Executar setupAuthRedirect e marcar como inicializado
    try {
      setupAuthRedirect();
      setIsInitialized(true);
    } catch (error) {
      console.error('[App] Erro ao configurar redirecionamento:', error);
      // Ainda marcamos como inicializado para evitar tela em branco
      setIsInitialized(true);
    }
  }, []);

  // Só renderizar o conteúdo após a inicialização
  if (!isInitialized && typeof window !== 'undefined') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  )
} 