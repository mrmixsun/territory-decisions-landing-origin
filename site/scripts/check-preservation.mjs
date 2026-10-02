import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const baseline = 'ebf0639';
for (const file of ['content/landing.json']) {
  assert.deepEqual(await readFile(path.join(root,file)),execFileSync('git',['show',baseline+':'+file],{cwd:root}),file+' must preserve s1.5 content');
}
const normalize = s => s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
for (const file of ['index.html']) {
  const old = execFileSync('git',['show',baseline+':docs/'+file],{cwd:root,encoding:'utf8'});
  const current = await readFile(path.join(root,'site/dist',file),'utf8');
  const plain = normalize(current);
  for (const match of old.matchAll(/<(p|h1|h2|h3)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    const copy = normalize(match[2]);
    if(copy) assert.ok(plain.includes(copy),file+' missing content: '+copy);
  }
  assert.ok(!current.includes('https://www.figma.com/api/mcp/asset/'),'Temporary asset URL in '+file);
}
const css = await readFile(path.join(root,'site/dist/style.css'),'utf8');
for (const match of css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
  assert.ok(!/^https?:/.test(match[1]),'Remote CSS resource '+match[1]);
  assert.ok((await stat(path.resolve(root,'site/dist',match[1]))).size>0,'Empty resource '+match[1]);
}
const manifest = JSON.parse(await readFile(path.join(root,'design/origin-asset-manifest.json')));
for(const {file} of manifest.assets) assert.ok((await stat(path.join(root,'site/dist/assets',file))).size>0,'Missing Figma asset '+file);
console.log('Origin: текст лендинга s1.5 сохранён; CSS, шрифты и Figma-ресурсы локальны.');
