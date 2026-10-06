import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const baseline = 'ebf0639';
for (const file of ['content/landing.json']) {
  const current = JSON.parse(await readFile(path.join(root, file), 'utf8'));
  const expected = JSON.parse(execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root, encoding: 'utf8' }));
  // The navigation link belonged exclusively to the removed «Суть Концепции за 3 минуты» section.
  expected.nav = expected.nav.filter(item => item.id !== 'story');
  expected.nav.unshift({ href: 'why.html', label: 'Зачем менять подход' });
  expected.nav = expected.nav.map(item => ({
    ...item,
    label: ({
      'Что предлагает концепция': 'Что предлагает Концепция',
      'Что изменится в работе': 'Что изменится',
      'Полный текст концепции': 'Полный текст Концепции'
    })[item.label] || item.label
  }));
  // «Этапы перехода» и «Развитие концепции» are intentionally replaced by the new plan block.
  const implementation = current.sections.find(section => section.id === 'implementation');
  assert.ok(implementation, 'Missing implementation plan section');
  const transitionIndex = expected.sections.findIndex(section => section.id === 'transition');
  expected.sections = expected.sections.filter(section => !['transition', 'development'].includes(section.id));
  expected.sections.splice(transitionIndex, 0, implementation);
  expected.nav = expected.nav.filter(item => !['transition', 'development'].includes(item.id));
  expected.nav.splice(3, 0, current.nav.find(item => item.id === 'implementation'));
  // The participation block has a separate editorial brief: sharing and expert help replace the prior contact CTA.
  const materialsIndex = expected.sections.findIndex(section => section.id === 'materials');
  assert.ok(materialsIndex >= 0, 'Missing participation section');
  expected.sections.splice(materialsIndex, 1, current.sections.find(section => section.id === 'materials'));
  assert.deepEqual(current, expected, `${file} must preserve s1.5 content outside the removed section`);
}
const normalize = s => s.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
for (const file of ['index.html']) {
  let old = execFileSync('git',['show',baseline+':docs/'+file],{cwd:root,encoding:'utf8'});
  const removeSection = (html, id) => {
    const start = html.indexOf(`<section class="s11-section`, html.indexOf(`id="${id}"`) - 80);
    assert.ok(start >= 0, `Baseline ${id} section not found`);
    const end = html.indexOf('</section>', start) + '</section>'.length;
    return html.slice(0, start) + html.slice(end);
  };
  // The expert section had intentionally replaced the complete intro and slider.
  const storyStart = old.indexOf('<section class="s11-section s11-section--mist s11-story"');
  assert.ok(storyStart >= 0, 'Baseline story section not found');
  const storyEnd = old.indexOf('</section>', storyStart) + '</section>'.length;
  old = old.slice(0, storyStart) + old.slice(storyEnd);
  old = removeSection(old, 'transition');
  old = removeSection(old, 'development');
  old = removeSection(old, 'materials');
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
console.log('Origin: текст лендинга s1.5 вне удалённого блока сохранён; CSS, шрифты и Figma-ресурсы локальны.');
