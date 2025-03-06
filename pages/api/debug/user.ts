import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Inicializar Supabase
    const supabase = getSupabase();
    
    // Verificar sessão do usuário
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return res.status(500).json({ 
        error: 'Erro ao verificar sessão', 
        details: sessionError.message 
      });
    }
    
    // Verificar usuário atual
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return res.status(500).json({ 
        error: 'Erro ao verificar usuário', 
        details: userError.message 
      });
    }
    
    // Se tem usuário, tentar carregar alguns dados básicos para confirmar acesso
    let testDataResult = null;
    if (userData.user) {
      try {
        const { data: testData, error: testError } = await supabase
          .from('expenses')
          .select('id')
          .limit(1);
          
        testDataResult = {
          hasData: testData && testData.length > 0,
          error: testError ? testError.message : null
        };
      } catch (err) {
        testDataResult = {
          hasData: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        };
      }
    }
    
    // Retornar todas as informações
    return res.status(200).json({
      authenticated: !!userData.user,
      session: {
        exists: !!sessionData.session,
        expires: sessionData.session?.expires_at ? new Date(sessionData.session.expires_at * 1000).toISOString() : null
      },
      user: userData.user ? {
        id: userData.user.id,
        email: userData.user.email,
        lastSignIn: userData.user.last_sign_in_at
      } : null,
      testDataResult,
      env: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });
  } catch (error) {
    console.error('Erro na rota de debug:', error);
    return res.status(500).json({ 
      error: 'Erro interno', 
      details: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
} 