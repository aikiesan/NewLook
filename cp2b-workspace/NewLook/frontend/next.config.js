const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // IMPORTANT: Removed static export for Vercel deployment
  // Vercel supports full Next.js features including:
  // - Middleware (for authentication)
  // - Server-side rendering
  // - API routes
  // - Dynamic routes
  // If you need static export for Cloudflare Pages, set STATIC_EXPORT=true

  // Performance: Enable experimental optimizations
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: ['lucide-react', 'recharts', 'react-chartjs-2'],
  },

  // Performance: Optimize images
  images: {
    unoptimized: process.env.STATIC_EXPORT === 'true',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance: Enable compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Disabled React Strict Mode due to known incompatibility with Leaflet
  // React Strict Mode causes double-mounting in development which triggers
  // "Map container is already initialized" error from Leaflet
  // This only affects development; production builds work fine
  reactStrictMode: false,

  // Vercel handles trailing slashes automatically
  trailingSlash: false,

  // Performance: Enable HTTP compression
  compress: true,

  // Performance: Optimize production build
  productionBrowserSourceMaps: false,

  // Performance: Modularize imports for better tree-shaking
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

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

  // Performance: Configure webpack for better caching
  webpack: (config, { isServer }) => {
    // Optimize module resolution
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

    // Enable persistent caching for faster rebuilds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    return config;
  },
}

// Sentry configuration options
const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically annotate errors with commit information
  automaticVercelMonitors: true,
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports = withSentryConfig(nextConfig, sentryOptions);
