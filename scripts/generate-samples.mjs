/**
 * Generates warm, editorial-looking placeholder sample images for the
 * landing page and theme covers. Run once: `node scripts/generate-samples.mjs`.
 * Re-run any time — it overwrites. Swap in real photography whenever ready.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("./public/samples");
await fs.mkdir(root, { recursive: true });

// Each sample: id, dimensions, warm palette stops, caption (small-caps style),
// subtitle, and an optional "shape hint" that gets sketched in subtly.
const samples = [
  // Hero + before/after
  { id: "hero", w: 2400, h: 1600, palette: ["#f5e6c8", "#9e6a4a", "#2a1f17"], caption: "Golden hour", subtitle: "" },
  { id: "before-1", w: 1600, h: 1200, palette: ["#d9d4cc", "#7a7670", "#2a2824"], caption: "Before", subtitle: "A phone snap" },
  { id: "after-1", w: 1600, h: 1200, palette: ["#f0e4cf", "#a67a52", "#2e231a"], caption: "After", subtitle: "Kitchen · Sunday" },
  { id: "before-2", w: 1600, h: 1200, palette: ["#cdc8bf", "#6a665f", "#22201c"], caption: "Before", subtitle: "Backyard sprint" },
  { id: "after-2", w: 1600, h: 1200, palette: ["#e8d3b2", "#8f5f3a", "#2b1f15"], caption: "After", subtitle: "Autumn light" },
  { id: "before-3", w: 1600, h: 1200, palette: ["#d4cfc6", "#746f68", "#1f1d1a"], caption: "Before", subtitle: "Christmas chaos" },
  { id: "after-3", w: 1600, h: 1200, palette: ["#ecd3b7", "#8b3c2f", "#22150f"], caption: "After", subtitle: "Holiday card" },

  // Gallery
  { id: "g-1", w: 1200, h: 1600, palette: ["#f2dfbd", "#a57147", "#2c1e14"], caption: "Golden hour beach", subtitle: "" },
  { id: "g-2", w: 1400, h: 1400, palette: ["#d9c6a4", "#7a532f", "#241812"], caption: "Autumn cabin", subtitle: "" },
  { id: "g-3", w: 1800, h: 1200, palette: ["#eee2cb", "#907754", "#28201a"], caption: "Kinfolk kitchen", subtitle: "" },
  { id: "g-4", w: 1200, h: 1200, palette: ["#e3d4b8", "#7d674b", "#24201a"], caption: "Vintage Polaroid", subtitle: "" },
  { id: "g-5", w: 1200, h: 1600, palette: ["#c9b88c", "#58432a", "#1c140c"], caption: "Leibovitz studio", subtitle: "" },
  { id: "g-6", w: 1800, h: 1200, palette: ["#c7cab3", "#546044", "#1e2218"], caption: "National Geographic", subtitle: "" },
  { id: "g-7", w: 1200, h: 1200, palette: ["#efd8b6", "#a3583a", "#2c1a11"], caption: "Christmas morning", subtitle: "" },
  { id: "g-8", w: 1200, h: 1600, palette: ["#eed4a8", "#7a5733", "#20170d"], caption: "Pixar family", subtitle: "" },
  { id: "g-9", w: 1400, h: 1400, palette: ["#e9dfc7", "#b89669", "#2a2319"], caption: "Wes Anderson", subtitle: "" },

  // Theme covers (4:5 aspect)
  { id: "theme-golden-hour-beach", w: 1200, h: 1500, palette: ["#f6e1b7", "#b07747", "#2b1d10"], caption: "Golden hour beach", subtitle: "Linen · sand" },
  { id: "theme-autumn-cabin", w: 1200, h: 1500, palette: ["#d7b88a", "#7c4a2b", "#1c120a"], caption: "Autumn cabin", subtitle: "Cedar · amber" },
  { id: "theme-kinfolk-kitchen", w: 1200, h: 1500, palette: ["#f1e7d1", "#9a7d58", "#28201a"], caption: "Kinfolk kitchen", subtitle: "Flour · morning" },
  { id: "theme-vintage-polaroid", w: 1200, h: 1500, palette: ["#e5d6b4", "#805e3c", "#24190f"], caption: "Vintage Polaroid", subtitle: "Faded · warm" },
  { id: "theme-leibovitz", w: 1200, h: 1500, palette: ["#c6b28a", "#4b3622", "#12100b"], caption: "Leibovitz studio", subtitle: "Editorial" },
  { id: "theme-wes-anderson", w: 1200, h: 1500, palette: ["#f0e1b3", "#c6846f", "#2b1f19"], caption: "Wes Anderson", subtitle: "Symmetry" },
  { id: "theme-natgeo", w: 1200, h: 1500, palette: ["#c1c0a8", "#4f5440", "#181b13"], caption: "National Geographic", subtitle: "Expedition" },
  { id: "theme-film-noir", w: 1200, h: 1500, palette: ["#e5e3de", "#676461", "#0c0b0a"], caption: "Film noir", subtitle: "Shadows" },
  { id: "theme-christmas-morning", w: 1200, h: 1500, palette: ["#f1d4b4", "#a03e32", "#2a1410"], caption: "Christmas morning", subtitle: "Pajamas · tree" },
  { id: "theme-pixar", w: 1200, h: 1500, palette: ["#f4dba8", "#c97a4a", "#2c1a10"], caption: "Pixar family", subtitle: "Animated" },
  { id: "theme-manga", w: 1200, h: 1500, palette: ["#e2e0d0", "#7a8779", "#1d211a"], caption: "Manga · anime", subtitle: "Hand-drawn" },
  { id: "theme-superhero", w: 1200, h: 1500, palette: ["#ecc894", "#b23a3a", "#1e0c0c"], caption: "Superhero family", subtitle: "Capes · rooftop" },
  { id: "theme-cartoon", w: 1200, h: 1500, palette: ["#f1d487", "#cf6f34", "#221007"], caption: "Saturday cartoon", subtitle: "Primary colors" },
  { id: "theme-card-christmas", w: 1200, h: 1500, palette: ["#e8ceae", "#6d3930", "#1a0c0a"], caption: "Holiday card · Christmas", subtitle: "Wreath · snow" },
  { id: "theme-card-easter", w: 1200, h: 1500, palette: ["#f0d9cb", "#b48ea3", "#2a1f1f"], caption: "Holiday card · Easter", subtitle: "Tulips · morning" },
  { id: "theme-card-birthday", w: 1200, h: 1500, palette: ["#f5d8a8", "#c85a64", "#2a1318"], caption: "Birthday invitation", subtitle: "Candles · cake" },
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function svgFor({ w, h, palette, caption, subtitle, id }) {
  const [a, b, c] = palette;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="46%" r="78%">
        <stop offset="0%" stop-color="${a}"/>
        <stop offset="55%" stop-color="${b}"/>
        <stop offset="100%" stop-color="${c}"/>
      </radialGradient>
      <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c}" stop-opacity="0.15"/>
        <stop offset="70%" stop-color="${c}" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="${c}" stop-opacity="0.55"/>
      </linearGradient>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
        <feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0 0.05  0 0 0 0.1 0"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <ellipse cx="${w * 0.35}" cy="${h * 0.72}" rx="${w * 0.3}" ry="${h * 0.12}" fill="${c}" opacity="0.3"/>
    <ellipse cx="${w * 0.65}" cy="${h * 0.78}" rx="${w * 0.28}" ry="${h * 0.1}" fill="${c}" opacity="0.25"/>
    <circle cx="${w * 0.42}" cy="${h * 0.56}" r="${Math.min(w, h) * 0.07}" fill="${a}" opacity="0.55"/>
    <circle cx="${w * 0.58}" cy="${h * 0.58}" r="${Math.min(w, h) * 0.06}" fill="${a}" opacity="0.5"/>
    <circle cx="${w * 0.5}" cy="${h * 0.55}" r="${Math.min(w, h) * 0.055}" fill="${a}" opacity="0.5"/>
    <rect width="100%" height="100%" fill="url(#vignette)"/>
    <rect width="100%" height="100%" filter="url(#noise)" opacity="0.35"/>
    <g font-family="Georgia, serif" text-anchor="middle">
      <text x="50%" y="${h - 80}" font-size="${Math.round(Math.min(w, h) * 0.032)}" fill="${a}" opacity="0.78" letter-spacing="6">${esc(caption.toUpperCase())}</text>
      ${subtitle ? `<text x="50%" y="${h - 40}" font-size="${Math.round(Math.min(w, h) * 0.022)}" fill="${a}" opacity="0.48">${esc(subtitle)}</text>` : ""}
    </g>
  </svg>`;
}

for (const s of samples) {
  const svg = svgFor(s);
  const buf = Buffer.from(svg);
  const out = path.join(root, `${s.id}.jpg`);
  await sharp(buf).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  console.log(`Wrote ${out}`);
}

console.log(`\nDone. ${samples.length} sample images under ./public/samples/`);
