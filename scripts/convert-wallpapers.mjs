import { mkdir, copyFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'wallpapers');

const srcDir = path.join(root, 'raw');
const files = [
  ['desktop.jpg', 'desktop.webp', 1600],
  ['desktop-dark.jpg', 'desktop-dark.webp', 1600],
  ['mobile.jpg', 'mobile.webp', 1080],
  ['mobile-dark.jpg', 'mobile-dark.webp', 1080],
];

await mkdir(outDir, { recursive: true });

for (const [srcName, destName, width] of files) {
  const src = path.join(srcDir, srcName);
  await access(src, constants.R_OK);
  const dest = path.join(outDir, destName);
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(dest);
  console.log(`wrote ${destName}`);
}

await copyFile(path.join(root, 'CNAME'), path.join(root, 'public', 'CNAME'));
console.log('copied CNAME');
