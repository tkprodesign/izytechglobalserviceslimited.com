/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Limit build workers so static generation stays within memory limits
  experimental: {
    cpus: 1,
    workerThreads: false,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@backend/expressApp');
    }
    config.resolve.alias['@backend'] = path.resolve(__dirname, '../backend');
    return config;
  },
};

export default nextConfig;
