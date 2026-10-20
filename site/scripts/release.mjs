import { execFileSync } from 'node:child_process';
import { cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const script of ['build.mjs', 'check.mjs', 'check-preservation.mjs', 'check-seo.mjs']) {
  execFileSync(process.execPath, [path.join(siteDir, 'scripts', script)], { cwd: siteDir, stdio: 'inherit' });
}
await cp(path.join(siteDir, 'dist'), path.join(siteDir, '..', 'docs'), { recursive: true });
// Historical prototypes are kept for review, but are not intended for search.
for (const name of ['isometric-hero-prototype.html', 'isometric-hero-v2-prototype.html']) {
  const file = path.join(siteDir, '..', 'docs', name);
  try {
    const html = await readFile(file, 'utf8');
    if (!html.includes('name="robots"')) await writeFile(file, html.replace(/<head>/i, '<head><meta name="robots" content="noindex, nofollow">'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
console.log('Проверенная публикационная сборка обновлена в docs/. Отправка в GitHub выполняется отдельно.');
