/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow loading images from GitHub avatars
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_GITHUB_OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER ?? 'psgmx',
    NEXT_PUBLIC_GITHUB_REPO:  process.env.NEXT_PUBLIC_GITHUB_REPO  ?? 'engineering-readiness',
  },
  experimental: {
    outputFileTracingIncludes: {
      '/**/*': ['./*.json', './students/**/*', './activities/**/*'],
    },
  },
}

export default nextConfig
