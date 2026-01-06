import type { NextConfig } from "next";
/** @type {import('next').Next} */
const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.BASE_PATH || '',
  assetPrefix: process.env.BASE_PATH || '',
  images: {
    unoptimized: true, 
};

export default nextConfig;
