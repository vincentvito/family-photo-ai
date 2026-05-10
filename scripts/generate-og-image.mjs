import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const publicDir = path.join(root, "public");
const outPath = path.join(publicDir, "og-image.png");

const WIDTH = 1200;
const HEIGHT = 630;

const sample = (name) => path.join(publicDir, "samples", name);
const selfieSource = sample("before-pixar-family.jpg");

const images = [
  {
    src: selfieSource,
    crop: { left: 0, top: 0, width: 724, height: 543 },
    x: 74,
    y: 226,
    width: 128,
    height: 160,
    rotate: -4,
  },
  {
    src: selfieSource,
    crop: { left: 724, top: 0, width: 724, height: 543 },
    x: 190,
    y: 238,
    width: 130,
    height: 162,
    rotate: 4,
  },
  {
    src: selfieSource,
    crop: { left: 724, top: 543, width: 724, height: 543 },
    x: 314,
    y: 224,
    width: 132,
    height: 164,
    rotate: -2,
  },
  {
    src: sample("after-1.jpg"),
    x: 548,
    y: 56,
    width: 274,
    height: 206,
    label: "Kitchen editorial",
  },
  { src: sample("after-2.jpg"), x: 854, y: 92, width: 282, height: 212, label: "Autumn portrait" },
  { src: sample("after-3.jpg"), x: 650, y: 334, width: 352, height: 228, label: "Holiday card" },
];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function roundedRectClip(width, height, radius) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );
}

async function photoComposite({ src, crop, x, y, width, height, rotate = 0 }) {
  const innerWidth = width - 16;
  const innerHeight = height - 16;
  const photoInput = crop ? sharp(src).extract(crop) : sharp(src);
  const photo = await photoInput
    .resize(innerWidth, innerHeight, { fit: "cover" })
    .composite([{ input: roundedRectClip(innerWidth, innerHeight, 15), blend: "dest-in" }])
    .png()
    .toBuffer();

  const frame = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 250, b: 242, alpha: 1 },
    },
  })
    .composite([
      { input: photo, left: 8, top: 8 },
      { input: roundedRectClip(width, height, 22), blend: "dest-in" },
    ])
    .png()
    .toBuffer();

  const input = rotate
    ? await sharp(frame)
        .rotate(rotate, { background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer()
    : frame;

  return { input, left: x, top: y };
}

async function outputComposite({ src, x, y, width, height, label }) {
  const innerWidth = width - 20;
  const innerHeight = height - 20;
  const photo = await sharp(src)
    .resize(innerWidth, innerHeight, { fit: "cover" })
    .composite([{ input: roundedRectClip(innerWidth, innerHeight, 18), blend: "dest-in" }])
    .png()
    .toBuffer();

  const labelSvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="23" y="${height - 55}" width="${Math.max(178, label.length * 11 + 28)}" height="32" rx="16" fill="rgba(255,250,242,0.92)"/>
      <text x="36" y="${height - 33}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#4A3354">${escapeXml(label)}</text>
    </svg>
  `);

  const frame = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 250, b: 242, alpha: 1 },
    },
  })
    .composite([
      { input: photo, left: 10, top: 10 },
      { input: labelSvg, left: 0, top: 0 },
      { input: roundedRectClip(width, height, 26), blend: "dest-in" },
    ])
    .png()
    .toBuffer();

  return { input: frame, left: x, top: y };
}

const baseSvg = Buffer.from(`
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#fffaf2"/>
        <stop offset="42%" stop-color="#f5eadf"/>
        <stop offset="72%" stop-color="#efd0c2"/>
        <stop offset="100%" stop-color="#efc362"/>
      </linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#231c2b" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    <rect x="28" y="28" width="324" height="92" rx="28" fill="rgba(255,250,242,0.88)" stroke="rgba(74,51,84,0.12)" filter="url(#shadow)"/>
    <rect x="42" y="42" width="64" height="64" rx="20" fill="#fffaf2"/>
    <text x="114" y="78" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="850">
      <tspan fill="#4A3354">Family</tspan><tspan fill="#DF674A">Shoot</tspan>
    </text>
    <text x="116" y="103" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="#4A3354">familyshoot.com</text>
    <text x="46" y="494" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="900" fill="#231C2B">
      <tspan x="46" dy="0">From everyday selfies</tspan>
      <tspan x="46" dy="50">to a real family shoot.</tspan>
    </text>
    <text x="46" y="570" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#4A3354">
      <tspan x="46" dy="0">Upload a few references. Pick a vibe.</tspan>
      <tspan x="46" dy="31">Get polished portraits and cards.</tspan>
    </text>
    <rect x="64" y="158" width="224" height="44" rx="22" fill="#4A3354"/>
    <text x="80" y="187" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="850" fill="#fffaf2">Select 3 references</text>
    <rect x="548" y="22" width="246" height="44" rx="22" fill="#DF674A"/>
    <text x="563" y="51" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="850" fill="#fffaf2">Different finished vibes</text>
    <text x="374" y="305" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="900" fill="#DF674A">-&gt;</text>
  </svg>
`);

const logo = await sharp(path.join(publicDir, "logo-mark.svg"))
  .resize(52, 35, { fit: "contain" })
  .png()
  .toBuffer();

const photoLayers = await Promise.all(
  images.map((image) => (image.label ? outputComposite(image) : photoComposite(image))),
);

const base = await sharp(baseSvg).png().toBuffer();

await sharp(base)
  .composite([{ input: logo, left: 48, top: 56 }, ...photoLayers])
  .png({ quality: 90 })
  .toFile(outPath);

console.log(`Generated ${path.relative(root, outPath)} (${WIDTH}x${HEIGHT})`);
