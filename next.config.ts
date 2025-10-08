import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: process.env.FTP_HOST || '192.168.8.11',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: process.env.FTP_HOST || '192.168.8.11',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
