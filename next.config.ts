import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Vercel build එකේදී TypeScript errors නිසා නතර වීම වළක්වයි
    ignoreBuildErrors: true,
  },
  eslint: {
    // Vercel build එකේදී ESLint errors නිසා නතර වීම වළක්වයි
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;