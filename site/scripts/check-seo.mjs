import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const base = 'https://imt.gemsdev.ru/';
const pages = ['index.html', 'concept.html', 'why.html', 'discussion.html', 'privacy-policy.html', 'personal-data-consent.html', 'cookie-policy.html'];
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const robots = await readFile(path.join(dist, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${base}sitemap.xml`));
for (const page of pages) {
  const html = await readFile(path.join(dist, page), 'utf8');
  const url = base + (page === 'index.html' ? '' : page);
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`), `Incorrect canonical: ${page}`);
  assert.ok(html.includes(`property="og:image" content="${base}assets/social-preview-v1.jpg"`), `Missing social image: ${page}`);
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), `Missing sitemap URL: ${page}`);
  assert.ok(!html.includes('name="robots" content="noindex'), `Unexpected noindex: ${page}`);
}
const preview = await readFile(path.join(dist, 'city-hero-preview.html'), 'utf8');
assert.ok(preview.includes('name="robots" content="noindex, nofollow"'));
assert.ok(!sitemap.includes('preview'));
assert.ok((await stat(path.join(dist, 'assets', 'social-preview-v1.jpg'))).size > 0);
console.log('SEO: адреса, карта сайта, карточка шаринга и исключение прототипа проверены.');
