import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["sharp"],
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default config;
