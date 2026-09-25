import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import { storyAssets } from '../scripts/vendors.js';
const root = new URL('../', import.meta.url);

test('all page assets, local links and fragment targets resolve', async () => {
  const pages = (await readdir(root)).filter((file) => file.endsWith('.html'));
  const html = Object.fromEntries(
    await Promise.all(
      pages.map(async (file) => [file, await readFile(new URL(file, root), 'utf8')]),
    ),
  );
  for (const [file, source] of Object.entries(html)) {
    assert.equal((source.match(/<h1[ >]/g) ?? []).length, 1, file + ': one h1');
    const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, file + ': unique IDs');
    for (const [, url] of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|data:)/.test(url)) continue;
      const [target, hash] = url.split('#');
      const resolved = target || file;
      if (resolved.startsWith('vendor/story/')) {
        const entry = Object.entries(storyAssets).find(
          ([, name]) => 'vendor/story/' + name === resolved,
        );
        assert.ok(entry, 'known build asset: ' + resolved);
        await access(new URL('node_modules/' + entry[0], root));
      } else await access(new URL(resolved, root));
      if (hash && html[resolved])
        assert.ok(html[resolved].includes(`id="${hash}"`), `${file}: ${url}`);
    }
    assert.doesNotMatch(source, /@latest|emailjs|mobile-screen|documents\/blue-squares/);
  }
});

test('plain reading and lab pages ship no eager camera or third-party runtime', async () => {
  for (const file of (await readdir(root)).filter((file) => file.endsWith('.html'))) {
    if (file === 'index.html') continue;
    const source = await readFile(new URL(file, root), 'utf8');
    assert.doesNotMatch(source, /<script[^>]+src="https?:/);
    assert.doesNotMatch(source, /<script[^>]+src="[^\"]*vendor/);
  }
});
