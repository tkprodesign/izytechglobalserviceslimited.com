const path = require('path');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Rocket's import gate happy and build logs readable; the SPA is
  // type-loose (strict: false) and has no ESLint config of its own.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Limit build workers so static generation stays within memory limits.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },

  // The Express API (server/expressApp.js) is CommonJS and reads files from
  // disk at runtime (PDF fonts/logo). Keep it external to the server bundle
  // so __dirname resolves to the real files on disk.
  serverExternalPackages: ['express', 'pg', 'pdfkit'],

  webpack: (config, { isServer }) => {
    config.resolve.alias['@server'] = path.resolve(__dirname, './server');

    // The SPA was written for Vite and reads import.meta.env.VITE_API_URL.
    // Under Next.js there is no import.meta.env, so define it explicitly:
    // the API is same-origin by default, or NEXT_PUBLIC_VITE_API_URL if set.
    if (!isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'import.meta.env': JSON.stringify({
            VITE_API_URL: process.env.NEXT_PUBLIC_VITE_API_URL || '',
            BASE_URL: '/',
            MODE: process.env.NODE_ENV || 'production',
            DEV: false,
            PROD: true,
          }),
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;
