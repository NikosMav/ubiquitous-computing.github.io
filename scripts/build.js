import { storyAssets } from './vendors.js';
import { cp, mkdir, rm, readdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
// Only this fixed generated directory is ever removed.
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of await readdir(root)) {
  if (
    file.endsWith('.html') ||
    ['questions.json', 'intro-questions.json', 'LICENSE.md', 'NOTICE.md'].includes(file)
  )
    await copyFile(path.join(root, file), path.join(out, file));
}
for (const dir of ['css', 'js', 'assets', 'images', 'fonts', 'videos', 'documents', 'favicon'])
  await cp(path.join(root, dir), path.join(out, dir), { recursive: true });
const vision = path.join(root, 'node_modules/@mediapipe/tasks-vision');
const vendor = path.join(out, 'vendor/vision');
await mkdir(vendor, { recursive: true });
await cp(path.join(vision, 'wasm'), path.join(vendor, 'wasm'), { recursive: true });
await copyFile(path.join(vision, 'vision_bundle.mjs'), path.join(vendor, 'vision_bundle.mjs'));
console.log('Static site built in dist/. Runtime version is fixed by package-lock.json.');
const story = path.join(out, 'vendor/story');
await mkdir(story, { recursive: true });
for (const [source, destination] of Object.entries(storyAssets))
  await copyFile(path.join(root, 'node_modules', source), path.join(story, destination));

for (const [source, destination] of Object.entries({
  'jquery/LICENSE.txt': 'jquery-LICENSE.txt',
  'typed.js/LICENSE.txt': 'typed-LICENSE.txt',
  '@splidejs/splide/LICENSE': 'splide-LICENSE.txt',
  'chart.js/LICENSE.md': 'chart-LICENSE.md',
  'gsap/README.md': 'gsap-README.md',
}))
  await copyFile(path.join(root, 'node_modules', source), path.join(story, destination));
