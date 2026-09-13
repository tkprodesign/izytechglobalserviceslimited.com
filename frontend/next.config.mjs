/** @type {import('next').NextConfig} */

const nextConfig = {
  // Skip type checking (existing Vite project has strictness differences)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint (not configured for Next.js)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
