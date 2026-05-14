import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["sharp"],
  async redirects() {
    return [{ source: "/cards-landing", destination: "/cards", permanent: true }];
  },
  async headers() {
    return [
      {
        source: "/share/:token*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/api/share/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default config;
