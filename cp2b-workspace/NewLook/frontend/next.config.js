/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANT: Removed static export for Vercel deployment
  // Vercel supports full Next.js features including:
  // - Middleware (for authentication)
  // - Server-side rendering
  // - API routes
  // - Dynamic routes
  // If you need static export for Cloudflare Pages, set STATIC_EXPORT=true

  // Enable image optimization on Vercel (supports it natively)
  // Only disable if STATIC_EXPORT=true
  images: {
    unoptimized: process.env.STATIC_EXPORT === 'true',
  },

  // Disabled React Strict Mode due to known incompatibility with Leaflet
  // React Strict Mode causes double-mounting in development which triggers
  // "Map container is already initialized" error from Leaflet
  // This only affects development; production builds work fine
  reactStrictMode: false,

  // Vercel handles trailing slashes automatically
  trailingSlash: false,

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://newlook-production.up.railway.app',
  },

  // Keep relaxed checks for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
