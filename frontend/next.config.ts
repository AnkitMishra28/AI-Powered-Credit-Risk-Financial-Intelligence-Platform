import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained `.next/standalone` build (with a minimal `server.js`)
  // so the multi-stage frontend Dockerfile / docker-compose can run the app
  // without installing node_modules in the runtime image. Ignored by Vercel,
  // which uses its own build output.
  output: "standalone",
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
