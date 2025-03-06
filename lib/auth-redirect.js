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
    // Verificação estrita para garantir que o código só seja executado no cliente
    if (typeof window === 'undefined') {
        console.log('[Auth] Ignorando execução no lado do servidor');
        return;
    }

    try {
        // Função para limpar parâmetros de hash se presentes
        const cleanupAuthRedirect = () => {
            // Verifica se há tokens na URL (tanto no hash quanto como query params)
            const hasAuthInHash = window.location.hash &&
                (window.location.hash.includes('access_token') || window.location.hash.includes('error'));

            const hasAuthInQuery = window.location.search &&
                (window.location.search.includes('access_token') || window.location.search.includes('error'));

            if (hasAuthInHash || hasAuthInQuery) {
                console.log('[Auth] Detectado parâmetros de autenticação na URL, processando...');

                // Se há um erro na URL, exibi-lo antes de limpar
                if ((window.location.hash && window.location.hash.includes('error')) ||
                    (window.location.search && window.location.search.includes('error'))) {
                    const errorMessage = new URLSearchParams(
                        window.location.hash.slice(1) || window.location.search.slice(1)
                    ).get('error_description');

                    if (errorMessage) {
                        console.error('[Auth] Erro de autenticação:', errorMessage);
                        alert('Erro no login: ' + errorMessage);
                    }
                }

                // Se estamos em uma página de login/signup, redirecionar para o dashboard apenas se autenticado com sucesso
                if (window.location.pathname === '/' ||
                    window.location.pathname === '/login' ||
                    window.location.pathname === '/signup') {

                    // Verificar se há token de acesso (autenticação bem-sucedida)
                    if ((window.location.hash && window.location.hash.includes('access_token')) ||
                        (window.location.search && window.location.search.includes('access_token'))) {
                        console.log('[Auth] Autenticação bem-sucedida, redirecionando para dashboard');

                        // Pequeno atraso para garantir que o Supabase tenha tempo de processar o token
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 300);
                        return;
                    }
                }

                // Limpa o hash e/ou query params, mas mantém a rota atual
                const currentPath = window.location.pathname;
                window.history.replaceState(null, '', currentPath);
                console.log('[Auth] Parâmetros de autenticação removidos da URL');
            }
        };

        // Função para verificar e redirecionar se estamos em localhost após autenticação
        const checkLocalhostRedirect = () => {
            try {
                // Verifica se a URL contém localhost mas estamos hospedados no Netlify
                if (
                    window.location.href.includes('localhost') &&
                    document.referrer && document.referrer.includes('netlify')
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
            } catch (error) {
                console.error('[Auth] Erro ao verificar redirecionamento localhost:', error);
            }
        };

        // Executa as verificações
        cleanupAuthRedirect();
        checkLocalhostRedirect();
    } catch (error) {
        console.error('[Auth] Erro geral ao processar redirecionamentos:', error);
    }
}

// Este arquivo ajuda a resolver problemas de redirecionamento no Netlify após login/logout
// É executado automaticamente antes de qualquer operação de roteamento

// Executa a função na inicialização apenas se estiver no cliente
if (typeof window !== 'undefined') {
    // Usar setTimeout para garantir que a execução seja assíncrona e não bloqueie o carregamento da página
    setTimeout(() => {
        setupAuthRedirect();
    }, 0);
}

export default { setupAuthRedirect };