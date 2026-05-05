import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#F26B4A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="130" height="130" viewBox="0 0 64 64" fill="none">
        <rect x="40" y="14" width="9" height="5" rx="1.5" fill="#FFE3D6" />
        <rect x="12" y="20" width="40" height="30" rx="5" fill="#FFFFFF" />
        <rect x="12" y="20" width="40" height="8" rx="3" fill="#FFE3D6" />
        <circle cx="32" cy="37" r="9.5" fill="#231C2B" />
        <circle cx="32" cy="37" r="6" fill="#F26B4A" />
        <circle cx="28.5" cy="33.5" r="1.8" fill="#FFD27A" />
      </svg>
    </div>,
    { ...size },
  );
}
