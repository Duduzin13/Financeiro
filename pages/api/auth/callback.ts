import { NextApiRequest, NextApiResponse } from 'next';
import { initSupabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = initSupabase();

  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código de autenticação inválido.' });
    }

    // Trocar o código de autenticação por um token de acesso
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Erro ao trocar código por sessão:', error);
      return res.status(500).json({ error: 'Erro ao processar autenticação.' });
    }

    // Redirecionar para o dashboard após autenticação bem-sucedida
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erro no callback de autenticação:', error);
    // Redirecionar para o dashboard mesmo em caso de erro
    res.redirect('/dashboard');
  }
}