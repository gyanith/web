import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    styledJsx: true
  },

  images: {
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
    ],
  },

  allowedDevOrigins: ['*'],
};

export default nextConfig;
