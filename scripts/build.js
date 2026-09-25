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
for (const dir of ['css', 'js', 'assets'])
  await cp(path.join(root, dir), path.join(out, dir), { recursive: true });
const vision = path.join(root, 'node_modules/@mediapipe/tasks-vision');
const vendor = path.join(out, 'vendor/vision');
await mkdir(vendor, { recursive: true });
await cp(path.join(vision, 'wasm'), path.join(vendor, 'wasm'), { recursive: true });
await copyFile(path.join(vision, 'vision_bundle.mjs'), path.join(vendor, 'vision_bundle.mjs'));
console.log('Static site built in dist/. Runtime version is fixed by package-lock.json.');
