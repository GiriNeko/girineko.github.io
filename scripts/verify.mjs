import { readFile, access, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const errors = [];

async function mustExist(rel) {
  try {
    await access(path.join(dist, rel), constants.R_OK);
  } catch {
    errors.push(`missing ${rel}`);
  }
}

async function mustContain(rel, snippet, label = snippet) {
  const file = path.join(dist, rel);
  const html = await readFile(file, 'utf8');
  if (!html.includes(snippet)) errors.push(`${rel} missing ${label}`);
  return html;
}

await mustExist('index.html');
await mustExist('CNAME');
await mustExist('.nojekyll');
await mustExist('wallpapers/desktop.webp');
await mustExist('wallpapers/desktop-dark.webp');
await mustExist('wallpapers/mobile.webp');
await mustExist('wallpapers/mobile-dark.webp');

const html = await mustContain('index.html', 'blog.ineko.cc', 'blog link');
await mustContain('index.html', '我的博客', 'blog label');
await mustContain('index.html', '赣ICP备 2020013131号', 'ICP');
await mustContain('index.html', '24682580', 'moe ICP');
await mustContain('index.html', 'upyun_logo2.png', 'upyun');
await mustContain('index.html', 'ineko-form', 'no-FOUC theme boot');
await mustContain('index.html', 'data-form="sheathed"', 'default form');
await mustContain('index.html', 'data-flash="on"', 'flash default on');
await mustContain('index.html', 'ineko-flash', 'flash persistence');
await mustContain('index.html', 'data-auto="on"', 'auto default on');
await mustContain('index.html', 'ineko-auto', 'auto persistence');
await mustContain('index.html', 'orientation: portrait', 'mobile art-direction');

if (!html.includes('GiriNeko')) errors.push('identity GiriNeko missing');

const assets = await readdir(path.join(dist, '_astro')).catch(() => []);
const hasMotion = assets.some((f) => f.includes('motion') || f.includes('FormToggle') || f.includes('gsap'));
if (!hasMotion) errors.push('motion chunk not found');
const webgl = assets.find((f) => f.startsWith('webgl.'));
if (!webgl) errors.push('webgl chunk not found');
if (webgl && html.includes(`/_astro/${webgl}`)) errors.push('webgl chunk eagerly referenced from index.html');

const cname = (await readFile(path.join(dist, 'CNAME'), 'utf8')).trim();
if (cname !== 'ineko.cc') errors.push(`CNAME is ${cname}`);

if (errors.length) {
  console.error('verify failed:');
  for (const err of errors) console.error(' -', err);
  process.exit(1);
}

console.log('verify ok');
