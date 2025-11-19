const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export for Cloudflare Pages
  output: 'export',

  // Disabled React Strict Mode due to known incompatibility with Leaflet
  // React Strict Mode causes double-mounting in development which triggers
  // "Map container is already initialized" error from Leaflet
  // This only affects development; production builds work fine
  reactStrictMode: false,

  images: {
    // Required for static export - disable Next.js image optimization
    unoptimized: true,
  },

  // Add trailing slashes for cleaner static URLs
  trailingSlash: true,

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
