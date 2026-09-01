import type { NextConfig } from "next";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "https://jobdam.https.gsmsv.site";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${BACKEND_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
