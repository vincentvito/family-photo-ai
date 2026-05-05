import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FamilyShoot — Family photos you'll actually print.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #FBF8F3 0%, #FFE3D6 55%, #FFD27A 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "72px 80px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: "#231C2B",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="76" height="76" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="14" fill="#F26B4A" />
          <rect x="40" y="14" width="9" height="5" rx="1.5" fill="#FFE3D6" />
          <rect x="12" y="20" width="40" height="30" rx="5" fill="#FFFFFF" />
          <rect x="12" y="20" width="40" height="8" rx="3" fill="#FFE3D6" />
          <circle cx="32" cy="37" r="9.5" fill="#231C2B" />
          <circle cx="32" cy="37" r="6" fill="#F26B4A" />
          <circle cx="28.5" cy="33.5" r="1.8" fill="#FFD27A" />
        </svg>
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: -0.5,
            color: "#231C2B",
          }}
        >
          FamilyShoot
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "auto",
          gap: 24,
        }}
      >
        <div
          style={{
            fontSize: 84,
            lineHeight: 1.02,
            fontWeight: 800,
            letterSpacing: -2,
            maxWidth: 980,
            color: "#231C2B",
          }}
        >
          Family photos you&rsquo;ll actually print.
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.3,
            color: "#4A3557",
            maxWidth: 900,
            fontWeight: 500,
          }}
        >
          Turn scattered iPhone photos into a frame-worthy portrait — in about two minutes.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 56,
          fontSize: 22,
          color: "#6B6474",
          fontWeight: 500,
          letterSpacing: 0.4,
        }}
      >
        familyshoot.com
      </div>
    </div>,
    { ...size },
  );
}
