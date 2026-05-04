import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FamilyShoot",
    short_name: "FamilyShoot",
    description:
      "Turn scattered iPhone photos into a frame-worthy family portrait — in about two minutes.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#f26b4a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
