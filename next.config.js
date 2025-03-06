/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        appDir: false,
    },
    async redirects() {
        return [{
            source: '/auth/callback',
            destination: '/dashboard',
            permanent: false,
        }, ]
    }
}

module.exports = nextConfig