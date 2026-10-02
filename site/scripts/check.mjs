import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const pageNames = ['index.html', 'concept.html'];
const files = new Set(await readdir(dist));
for (const file of pageNames) if (!files.has(file)) throw new Error(`Нет ${file}; сначала выполните npm run build`);
const pages = Object.fromEntries(await Promise.all(pageNames.map(async file => [file, await readFile(path.join(dist, file), 'utf8')])));
for (const [file, html] of Object.entries(pages)) {
  for (const resource of ['style.css', 'main.js']) {
    const hash = createHash('sha256').update(await readFile(path.join(dist, resource))).digest('hex').slice(0, 12);
    assert.ok(html.includes(`./${resource}?v=${hash}`), `${file}: версия ${resource} должна соответствовать содержимому`);
  }
  if ((html.match(/<h1\b/g) || []).length !== 1) throw new Error(`${file}: должна быть одна h1`);
  for (const target of ['style.css', 'tokens.css', 'main.js', 'favicon.svg']) if (!files.has(target)) throw new Error(`Нет ${target}`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (/^(?:https:\/\/|mailto:|tel:)/.test(href)) continue;
    if (href.startsWith('#')) { if (!html.includes(`id="${href.slice(1)}"`)) throw new Error(`${file}: нет якоря ${href}`); continue; }
    const [localWithQuery, fragment] = href.replace(/^\.\//, '').split('#');
    const local = localWithQuery.split('?')[0];
    if (!local || local.endsWith('.css') || local.endsWith('.svg')) continue;
    if (!files.has(local)) throw new Error(`${file}: нет страницы ${local}`);
    if (fragment && !pages[local]?.includes(`id="${fragment}"`)) throw new Error(`${file}: нет якоря ${href}`);
  }
  for (const [, src] of html.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
    const local = src.replace(/^\.\//, '').split('?')[0];
    await stat(path.join(dist, local));
  }
}
const concept = pages['concept.html'];
for (let n = 0; n <= 13; n++) if (!concept.includes(`id="section-${n}"`)) throw new Error(`Нет раздела section-${n}`);
console.log('Проверка пройдена: 2 страницы, ссылки, ресурсы, введение и 13 разделов полного текста.');

const contentRoot = path.resolve(dist, '../../content');
const source = JSON.parse(await readFile(path.join(contentRoot, 'full-text-source.json'), 'utf8'));
const fullText = await readFile(path.join(contentRoot, 'full-text.md'));
assert.equal(createHash('sha256').update(fullText).digest('hex'), source.sha256, 'Полный текст изменился относительно мастер-версии');
for (const id of ['appendix-a', 'appendix-b', ...Array.from({length:4}, (_, i) => `source-${i+1}`), ...Object.keys(source.legacyAnchors)]) {
  assert.ok(concept.includes(`id="${id}"`), `Нет якоря ${id}`);
}
assert.ok(!concept.includes('Авторские и рабочие материалы'), 'В публичную редакцию попали внутренние рабочие материалы');
assert.ok(!concept.includes('id="source-5"'), 'В публичную редакцию попали авторские источники');
assert.ok(!concept.includes('href="#"'), 'Ссылка без назначения в полном тексте');
console.log('Мастер-версия: контрольная сумма, приложения, источники и прежние якоря проверены.');

const landing = pages['index.html'];
assert.equal((landing.match(/class="expert-row"/g) || []).length, 6, 'Нужны шесть экспертных строк');
assert.ok(!landing.includes('s11-story-shell') && !landing.includes('Суть за одну минуту'), 'Старый блок и слайдер должны быть удалены');
assert.match(landing, /<\/section>\s*<section class="experts-section"/, 'Блок экспертов должен следовать сразу за первым экраном');
console.log('Эксперты: шесть строк сразу под hero; прежний блок и слайдер удалены.');
