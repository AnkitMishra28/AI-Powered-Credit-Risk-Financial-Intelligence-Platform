import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained `.next/standalone` build (with a minimal `server.js`)
  // so the multi-stage frontend Dockerfile / docker-compose can run the app
  // without installing node_modules in the runtime image. Ignored by Vercel,
  // which uses its own build output.
  output: "standalone",
};

export default nextConfig;
