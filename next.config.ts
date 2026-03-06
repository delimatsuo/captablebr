import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["firebase-admin", "@google-cloud/storage", "@google-cloud/vertexai"],
};

export default nextConfig;
