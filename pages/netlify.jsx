import React from 'react';

export default function NetlifyTest() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Teste de Página no Netlify</h1>
      <p>Esta página é usada para testar a configuração do Netlify.</p>

      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h2>Informações do Ambiente</h2>
        <pre>
          {JSON.stringify({
            nextPublic: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não definido',
            nodeEnv: process.env.NODE_ENV,
            buildTime: new Date().toISOString(),
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Links de Teste</h2>
        <ul>
          <li>
            <a href="/_next/static/chunks/pages/netlify.js" target="_blank">
              Testar arquivo JS desta página
            </a>
          </li>
          <li>
            <a href="/_next/static/css/app.css" target="_blank">
              Testar arquivo CSS (pode não existir)
            </a>
          </li>
          <li>
            <a href="/dashboard" target="_blank">
              Ir para Dashboard
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
} 