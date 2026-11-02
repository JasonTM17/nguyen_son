import { mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const original = "public/nguyen-son-studio-avatar-clean.png";
const temporary = "node_modules/.cache/portfolio-media";
mkdirSync(new URL(`../${temporary}/`, import.meta.url), { recursive: true });
function convert(...args) {
  const result = spawnSync("magick", args, { cwd: root, encoding: "utf8", windowsHide: true });
  if (result.error || result.status !== 0) throw new Error("ImageMagick generation failed. Install ImageMagick with WebP/AVIF support.");
}
for (const width of [640, 1023]) {
  const resize = width === 640 ? ["-resize", "640x"] : [];
  convert(original, ...resize, "-strip", "-quality", "84", `public/nguyen-son-studio-${width}.webp`);
  convert(original, ...resize, "-strip", "-define", "heic:speed=6", "-quality", "62", `public/nguyen-son-studio-${width}.avif`);
}
convert("scripts/assets/social-card.svg", `${temporary}/background.png`);
convert(original, "-resize", "366x550", `${temporary}/portrait.png`);
convert(`${temporary}/background.png`, `${temporary}/portrait.png`, "-geometry", "+777+40", "-composite", "-strip", "public/social-preview.png");
convert("-background", "none", "public/favicon.svg", "-resize", "180x180", "public/apple-touch-icon.png");
convert("-background", "none", "public/favicon.svg", "-define", "icon:auto-resize=48,32,16", "public/favicon.ico");
for (const file of ["nguyen-son-studio-640.avif", "nguyen-son-studio-1023.avif", "nguyen-son-studio-640.webp", "nguyen-son-studio-1023.webp", "social-preview.png"]) {
  console.log(`${file}: ${statSync(new URL(`../public/${file}`, import.meta.url)).size} bytes`);
}
