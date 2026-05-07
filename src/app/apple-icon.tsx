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
        <path
          d="M13 26.6c0-4.2 3.4-7.6 7.6-7.6h22.8c4.2 0 7.6 3.4 7.6 7.6v18.8c0 4.2-3.4 7.6-7.6 7.6H20.6c-4.2 0-7.6-3.4-7.6-7.6V26.6Z"
          fill="#FBF8F3"
        />
        <path
          d="M19 18.5c0-2 1.6-3.5 3.5-3.5h9c1.9 0 3.5 1.5 3.5 3.5V21H19v-2.5Z"
          fill="#FFD27A"
        />
        <path
          d="M42 17h8c1.7 0 3 1.3 3 3v3h-8.5A2.5 2.5 0 0 1 42 20.5V17Z"
          fill="#FFE3D6"
        />
        <path
          d="M19 42.2c2.4-5.1 7.1-8.2 13-8.2s10.6 3.1 13 8.2V46c0 1.1-.9 2-2 2H21c-1.1 0-2-.9-2-2v-3.8Z"
          fill="#4A3557"
        />
        <circle cx="32" cy="29.5" r="8.5" fill="#8AAE9B" />
        <circle cx="23.5" cy="34" r="5.5" fill="#FFD27A" />
        <circle cx="40.5" cy="34" r="5.5" fill="#FFE3D6" />
        <circle cx="32" cy="29.5" r="4.3" fill="#FBF8F3" />
        <path d="M20 24h24" stroke="#EDE6DB" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>,
    { ...size },
  );
}
