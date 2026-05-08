/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "FamilyShoot - turn everyday family selfies into polished portraits and cards in different vibes.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";
const assetUrl = (path: string) => new URL(path, SITE_URL).toString();

const logoMark = assetUrl("/logo-mark.svg");

const selfies = [
  {
    src: assetUrl("/samples/before-1.jpg"),
    x: 62,
    y: 176,
    width: 152,
    height: 114,
    rotate: -4,
  },
  {
    src: assetUrl("/samples/before-2.jpg"),
    x: 192,
    y: 186,
    width: 154,
    height: 116,
    rotate: 4,
  },
  {
    src: assetUrl("/samples/before-3.jpg"),
    x: 320,
    y: 174,
    width: 158,
    height: 118,
    rotate: -2,
  },
];

const outputs = [
  {
    src: assetUrl("/samples/after-1.jpg"),
    label: "Kitchen editorial",
    x: 548,
    y: 56,
    width: 274,
    height: 206,
  },
  {
    src: assetUrl("/samples/after-2.jpg"),
    label: "Autumn portrait",
    x: 854,
    y: 92,
    width: 282,
    height: 212,
  },
  {
    src: assetUrl("/samples/after-3.jpg"),
    label: "Holiday card",
    x: 650,
    y: 334,
    width: 352,
    height: 228,
  },
];

function PhotoFrame({
  src,
  x,
  y,
  width,
  height,
  rotate = 0,
}: {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        display: "flex",
        padding: 8,
        background: "#fffaf2",
        border: "1px solid rgba(74, 51, 84, 0.14)",
        borderRadius: 22,
        boxShadow: "0 24px 58px rgba(35, 28, 43, 0.22)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <img
        src={src}
        alt=""
        width={width - 16}
        height={height - 16}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 15,
        }}
      />
    </div>
  );
}

function OutputFrame({ src, label, x, y, width, height }: (typeof outputs)[number]) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        display: "flex",
        padding: 10,
        background: "#fffaf2",
        border: "1px solid rgba(74, 51, 84, 0.14)",
        borderRadius: 26,
        boxShadow: "0 28px 72px rgba(35, 28, 43, 0.24)",
      }}
    >
      <img
        src={src}
        alt=""
        width={width - 20}
        height={height - 20}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 18,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 23,
          bottom: 23,
          display: "flex",
          padding: "8px 13px",
          borderRadius: 999,
          background: "rgba(255, 250, 242, 0.92)",
          color: "#4A3354",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: 0,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#f4eadf",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        color: "#231C2B",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(124deg, #fffaf2 0%, #f5eadf 42%, #efd0c2 72%, #efc362 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 28,
          top: 28,
          display: "flex",
          alignItems: "center",
          gap: 15,
          padding: "14px 18px 14px 14px",
          borderRadius: 28,
          background: "rgba(255, 250, 242, 0.88)",
          border: "1px solid rgba(74, 51, 84, 0.12)",
          boxShadow: "0 18px 46px rgba(35, 28, 43, 0.12)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fffaf2",
            borderRadius: 20,
          }}
        >
          <img
            src={logoMark}
            alt=""
            width={52}
            height={35}
            style={{ width: 52, height: 35, objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", fontSize: 36, fontWeight: 850, letterSpacing: 0 }}>
          <span style={{ color: "#4A3354" }}>Family</span>
          <span style={{ color: "#DF674A" }}>Shoot</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 46,
          bottom: 42,
          width: 430,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 48,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: 0,
          }}
        >
          From everyday selfies to a real family shoot.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            lineHeight: 1.26,
            color: "#4A3354",
            fontWeight: 700,
          }}
        >
          Upload a few references. Pick a vibe. Get polished portraits and cards.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 66,
          top: 144,
          display: "flex",
          padding: "8px 13px",
          borderRadius: 999,
          background: "#4A3354",
          color: "#fffaf2",
          fontSize: 18,
          fontWeight: 850,
        }}
      >
        3 quick references
      </div>
      <div
        style={{
          position: "absolute",
          left: 548,
          top: 22,
          display: "flex",
          padding: "8px 13px",
          borderRadius: 999,
          background: "#DF674A",
          color: "#fffaf2",
          fontSize: 18,
          fontWeight: 850,
        }}
      >
        Different finished vibes
      </div>

      {selfies.map((image) => (
        <PhotoFrame key={image.src} {...image} />
      ))}
      <div
        style={{
          position: "absolute",
          left: 374,
          top: 244,
          width: 150,
          height: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#DF674A",
          fontSize: 66,
          fontWeight: 900,
        }}
      >
        →
      </div>
      {outputs.map((image) => (
        <OutputFrame key={image.label} {...image} />
      ))}
    </div>,
    { ...size },
  );
}
