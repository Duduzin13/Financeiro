/**
 * Processa o redirecionamento de autenticação OAuth
 * Esta função verifica se a URL atual contém tokens de autenticação
 * e redireciona para a página dashboard se necessário
 */
export function handleAuthRedirect() {
    // Verifica se estamos no navegador
    if (typeof window === 'undefined') return;

    // Obter a URL atual
    const currentUrl = window.location.href;

    // Verificar se contém tokens de autenticação (access_token no hash)
    if (currentUrl.includes('access_token=') && currentUrl.includes('localhost:3000')) {
        // Extrair o token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
            console.log("Token de autenticação detectado! Redirecionando...");

            // Construir a nova URL de redirecionamento
            const netlifyUrl = 'https://financeiro-control.netlify.app/dashboard';

            // Redirecionar para a URL correta
            window.location.href = netlifyUrl;
        }
    }
}

/**
 * Função para ser utilizada em _app.tsx para configurar o redirecionamento
 * em todas as páginas
 */
export function setupAuthRedirect() {
    if (typeof window !== 'undefined') {
        // Função para limpar parâmetros de hash se presentes
        const cleanupAuthRedirect = () => {
            // Verifica se há tokens na URL
            if (window.location.hash && window.location.hash.includes('access_token')) {
                console.log('[Auth] Detectado hash de autenticação na URL, processando...');

                // Redirecionar para a página de dashboard se estivermos na raiz
                if (window.location.pathname === '/' || window.location.pathname === '/login') {
                    console.log('[Auth] Redirecionando para o dashboard após login');
                    window.location.href = '/dashboard';
                    return;
                }

                // Caso contrário, limpa o hash mas mantém a rota atual
                const currentPath = window.location.pathname;
                window.history.replaceState(null, '', currentPath);
                console.log('[Auth] Hash de autenticação removido da URL');
            }
        };

        // Função para verificar e redirecionar se estamos em localhost após autenticação
        const checkLocalhostRedirect = () => {
            // Verifica se a URL contém localhost mas estamos hospedados no Netlify
            if (
                window.location.href.includes('localhost') &&
                document.referrer.includes('netlify')
            ) {
                // Obter a URL atual e substituir localhost pela URL do Netlify
                const currentUrl = window.location.href;
                const netlifyUrl = 'https://financeiro-control.netlify.app';
                const pathAndQuery = currentUrl.split('localhost:3000')[1];

                // Redirecionar para a mesma página, mas no domínio do Netlify
                const targetUrl = netlifyUrl + pathAndQuery;

                console.log('[Auth] Redirecionando de localhost para:', targetUrl);
                window.location.href = targetUrl;
            }
        };

        // Executa as verificações
        cleanupAuthRedirect();
        checkLocalhostRedirect();
    }
}

// Este arquivo ajuda a resolver problemas de redirecionamento no Netlify após login/logout
// É executado automaticamente antes de qualquer operação de roteamento

// Executa a função na inicialização também, para pegar carregamentos iniciais da página
if (typeof window !== 'undefined') {
    setupAuthRedirect();
}

export default { setupAuthRedirect };