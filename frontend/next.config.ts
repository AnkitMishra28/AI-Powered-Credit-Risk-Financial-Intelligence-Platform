import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for containerized deployments (Docker), but disable on Vercel
  // to avoid conflicting with Vercel's native serverless packaging hooks.
  output: process.env.VERCEL ? undefined : "standalone",
  async rewrites() {
    // Only apply server-side rewrites if INTERNAL_BACKEND_URL is explicitly configured
    // (e.g. In Docker Compose: INTERNAL_BACKEND_URL=http://backend:8000/api/v1).
    // On Vercel, requests are dispatched directly from the client to NEXT_PUBLIC_API_URL.
    const backendUrl = process.env.INTERNAL_BACKEND_URL;
    if (!backendUrl) {
      return [];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
