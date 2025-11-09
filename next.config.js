/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
    ],
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // Solución específica para error de manifest en grupos de rutas
  transpilePackages: [],
  // Asegurar generación correcta de manifiestos
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig


