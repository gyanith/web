import type { NextConfig } from "next";


const isGithubPages =
  process.env.GITHUB_PAGES === "true" || process.env.GITHUB_ACTIONS === "true";
const repo = isGithubPages ? "web" : "";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledJsx: true
  },

  output: "export",
  basePath: repo ? `/${repo}` : undefined,
  assetPrefix: repo ? `/${repo}/` : undefined,

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'console.gyanith.org',
        port: '',
        pathname: '/v1/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
    ],
  },

  allowedDevOrigins: ['*'],
};

export default nextConfig;
