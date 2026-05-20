import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.loca.lt', '*.serveousercontent.com', '133.14.231.68', '133.14.212.78', '133.14.218.74'],
  experimental: {
    serverActions: {
      allowedOrigins: ['*.loca.lt', '*.serveousercontent.com', '133.14.231.68:3000', '133.14.212.78:3000', '133.14.218.74:3000', 'localhost:3000']
    }
  }
};

export default nextConfig;
