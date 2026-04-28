import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "landers-time-logo.png");

async function buildSquare(size, outPath) {
  const srcMeta = await sharp(SRC).metadata();
  const trimmedBuf = await sharp(SRC)
    .trim({ background: "white", threshold: 40 })
    .toBuffer();
  const meta = await sharp(trimmedBuf).metadata();
  console.log(`  src ${srcMeta.width}x${srcMeta.height} → trimmed ${meta.width}x${meta.height}`);

  const longest = Math.max(meta.width, meta.height);
  const padding = Math.round(longest * 0.08);
  const canvas = longest + padding * 2;

  const padded = await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: trimmedBuf, gravity: "center" }])
    .png()
    .toBuffer();

  await sharp(padded)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(outPath);

  console.log(`✓ ${outPath} (${size}x${size})`);
}

await buildSquare(512, path.join(ROOT, "src", "app", "icon.png"));
await buildSquare(180, path.join(ROOT, "src", "app", "apple-icon.png"));
