import { execFileSync } from 'node:child_process';
import { cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const script of ['build.mjs', 'check.mjs', 'check-preservation.mjs']) {
  execFileSync(process.execPath, [path.join(siteDir, 'scripts', script)], { cwd: siteDir, stdio: 'inherit' });
}
await cp(path.join(siteDir, 'dist'), path.join(siteDir, '..', 'docs'), { recursive: true });
console.log('Проверенная публикационная сборка обновлена в docs/. Отправка в GitHub выполняется отдельно.');
