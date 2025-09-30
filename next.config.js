/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React 19 features
  reactStrictMode: true,
  // Optimize development server
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Disable fast refresh for better stability
  experimental: {
    optimizePackageImports: ['framer-motion', '@headlessui/react'],
  },
  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

module.exports = nextConfig
