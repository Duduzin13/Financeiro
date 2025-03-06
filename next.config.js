/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true, // Necessário para deploy estático
    },
    trailingSlash: true, // Ajuda com redirecionamentos no Netlify
    poweredByHeader: false,
    // Não precisamos de output: 'standalone' no Netlify
}

module.exports = nextConfig