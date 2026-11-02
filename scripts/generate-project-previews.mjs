import { readFile, writeFile, mkdir, mkdtemp, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const entries = JSON.parse(await readFile(join(root, 'src/content/project-previews.json'), 'utf8'));
await mkdir(join(root, 'public/projects'), { recursive: true });
for (const entry of entries) {
  if (!/^JasonTM17\/[A-Za-z0-9_.-]+$/.test(entry.fullName) || !/^[a-f0-9]{40}$/.test(entry.commit) || !/^\/projects\/[a-z0-9-]+\.webp$/.test(entry.src) || entry.sourcePath.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid reviewed preview manifest');
  const response = await fetch(`https://raw.githubusercontent.com/${entry.fullName}/${entry.commit}/${entry.sourcePath}`, { redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('Screenshot source unavailable');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 8 * 1024 * 1024 || createHash('sha256').update(bytes).digest('hex') !== entry.sourceSha256) throw new Error('Screenshot source identity mismatch');
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-preview-'));
  const original = join(directory, 'source.' + entry.sourcePath.split('.').pop());
  try {
    await writeFile(original, bytes);
    execFileSync('magick', [original, '-auto-orient', '-resize', '1100x>', '-gravity', 'north', '-crop', '1100x740+0+0', '+repage', '-strip', '-quality', '82', join(root, 'public', entry.src.slice(1))]);
    console.log(entry.src);
  } finally { await unlink(original).catch(() => {}); await rmdir(directory); }
}
