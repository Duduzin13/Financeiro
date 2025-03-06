/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    // Configurações necessárias para compatibilidade com o Netlify
    distDir: '.next',
    experimental: {
        webpackBuildWorker: true,
        parallelServerBuildTraces: true,
        parallelServerCompiles: true,
        appDir: false,
    },
    trailingSlash: true,
    // Garantindo que geração estática seja usada ao máximo
    target: 'serverless',
    async redirects() {
        return [{
            source: '/auth/callback',
            destination: '/dashboard',
            permanent: false,
        }]
    }
}

// Função para mesclar configurações personalizadas
const mergeConfig = (nextConfig, userConfig) => {
    if (!userConfig) {
        return nextConfig;
    }

    for (const key in userConfig) {
        if (
            typeof nextConfig[key] === 'object' &&
            !Array.isArray(nextConfig[key])
        ) {
            nextConfig[key] = {
                ...nextConfig[key],
                ...userConfig[key],
            }
        } else {
            nextConfig[key] = userConfig[key]
        }
    }

    return nextConfig;
}

// Tenta importar configurações personalizadas
let userConfig = undefined;
try {
    const { default: importedConfig } = await
    import ('./v0-user-next.config.js').catch(() => ({ default: undefined }));
    userConfig = importedConfig;
} catch (e) {
    // Ignorar erro
    console.log('No user config found or error loading it.');
}

export default mergeConfig(nextConfig, userConfig);