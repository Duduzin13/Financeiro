/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true, // Necessário para deploy estático
    },
    trailingSlash: true, // Ajuda com redirecionamentos no Netlify
    poweredByHeader: false,
    // Ignora erros de ESLint durante o build
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ignora erros de TypeScript durante o build
    typescript: {
        ignoreBuildErrors: true,
    },
    // Não precisamos de output: 'standalone' no Netlify
}

module.exports = nextConfig