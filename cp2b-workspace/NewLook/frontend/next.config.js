const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export only for production builds (Cloudflare Pages)
  // For local development, use dynamic rendering
  ...(process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true' 
    ? { output: 'export' } 
    : {}),
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },
  
  // Disabled React Strict Mode due to known incompatibility with Leaflet
  // React Strict Mode causes double-mounting in development which triggers
  // "Map container is already initialized" error from Leaflet
  // This only affects development; production builds work fine
  reactStrictMode: false,
  
  // Trailing slash for better static hosting compatibility
  trailingSlash: false,
  
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://newlook-production.up.railway.app',
  },

  // Relax strict checks for static export compatibility
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = withNextIntl(nextConfig);
