import { validRepository, repositoryImage, imageScore, readmeCandidates } from './candidates.mjs';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
async function boundedText(response, maximum) {
  if (!response.ok) return null;
  const reader = response.body.getReader(); let bytes = 0; const chunks = [];
  try { while (true) { const part = await reader.read(); if (part.done) break; bytes += part.value.byteLength; if (bytes > maximum) throw new Error('Document too large'); chunks.push(Buffer.from(part.value)); } }
  finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks).toString('utf8');
}
export async function discoverRepositoryPreview(fullName, { fetchImpl = fetch, now = Date.now } = {}) {
  if (!validRepository(fullName)) throw new Error('Invalid repository');
  const signal = AbortSignal.timeout(8000);
  const request = (url, method = 'GET') => fetchImpl(url, { method, redirect: method === 'HEAD' ? 'manual' : 'error', signal, headers: { 'User-Agent': 'NguyenSonPortfolio/1.0', Accept: method === 'HEAD' ? 'image/avif,image/webp,image/png,image/jpeg,image/gif' : 'text/plain,application/json' } });
  let candidates = [];
  for (const filename of ['README.md', 'README.MD', 'readme.md']) {
    const response = await request(`https://raw.githubusercontent.com/${fullName}/HEAD/${filename}`);
    if (response.status === 404) continue;
    const markdown = await boundedText(response, 200_000);
    if (markdown === null) throw new Error('README unavailable');
    candidates = readmeCandidates(markdown, fullName); break;
  }
  const checked = new Set();
  async function firstValid(items) {
  for (const candidate of items.slice(0, 8)) {
    if (checked.has(candidate.imageUrl)) continue; checked.add(candidate.imageUrl);
    try {
      const response = await request(candidate.imageUrl, 'HEAD');
      const type = response.headers.get('content-type')?.split(';')[0]; const length = Number(response.headers.get('content-length'));
      let trustedAttachmentRedirect = false;
      if (candidate.attachment && [301,302,307,308].includes(response.status)) {
        try { const location = new URL(response.headers.get('location')); trustedAttachmentRedirect = location.protocol === 'https:' && !location.username && !location.password && !location.port && (/^github-production-user-asset-\d+\.s3\.amazonaws\.com$/.test(location.hostname) || location.hostname === 'private-user-images.githubusercontent.com'); } catch { /* Reject unrecognized redirects without following them. */ }
      }
      if (!trustedAttachmentRedirect && (!response.ok || !/^image\/(?:png|jpeg|webp|avif|gif)$/.test(type ?? '') || length > MAX_IMAGE_BYTES)) continue;
      const image = new URL(candidate.imageUrl); image.searchParams.set('v', String(Math.floor(now() / 300000)));
      return { fullName, verifiedAt: new Date(now()).toISOString(), stale: false, preview: { imageUrl: image.href, sourceUrl: candidate.sourceUrl } };
    } catch { if (signal.aborted) throw new Error('Preview lookup timed out'); }
  }
  return null;
  }
  const fromReadme = await firstValid(candidates);
  if (fromReadme) return fromReadme;
  candidates = ['docs/portfolio/cover.webp', 'docs/portfolio/cover.png', 'cover.png', 'docs/screenshots/home.png'].map(path => repositoryImage(path, fullName)).filter(Boolean);
  try {
    const treeResponse = await request(`https://api.github.com/repos/${fullName}/git/trees/HEAD?recursive=1`);
    const treeText = await boundedText(treeResponse, 2_000_000);
    if (treeText) {
      const tree = JSON.parse(treeText);
      if (Array.isArray(tree.tree)) candidates.push(...tree.tree.slice(0, 10000).filter(item => item.type === 'blob' && typeof item.path === 'string' && Number.isFinite(item.size) && item.size <= MAX_IMAGE_BYTES && imageScore(item.path) >= 20).sort((a,b) => imageScore(b.path) - imageScore(a.path)).slice(0, 8).map(item => repositoryImage(item.path, fullName)).filter(Boolean));
    }
  } catch { if (signal.aborted) throw new Error('Preview lookup timed out'); }
  const fallback = await firstValid(candidates);
  if (fallback) return fallback;
  return { fullName, verifiedAt: new Date(now()).toISOString(), stale: false, preview: null };
}
export function createPreviewService({ discover = discoverRepositoryPreview, now = Date.now } = {}) {
  const cache = new Map();
  return async fullName => {
    if (!validRepository(fullName)) throw new Error('Invalid repository');
    const previous = cache.get(fullName);
    if (previous?.inFlight) return previous.inFlight;
    if (previous && now() < previous.nextRead) {
      const age = now() - Date.parse(previous.data?.verifiedAt);
      if (previous.failed || !Number.isFinite(age) || age < 0 || age > 3600000) throw new Error('Preview unavailable');
      return previous.data;
    }
    const entry = previous ?? {};
    entry.inFlight = (async () => {
      try {
        const data = await discover(fullName); if (data.fullName !== fullName) throw new Error('Wrong preview identity'); entry.failed = false; entry.data = data; entry.nextRead = now() + (data.preview ? 300000 : 60000); return data;
      } catch {
        const age = now() - Date.parse(entry.data?.verifiedAt);
        if (entry.data && age >= 0 && age <= 3600000) { entry.data = { ...entry.data, stale: true }; entry.nextRead = now() + 60000; return entry.data; }
        entry.failed = true; entry.data = null; entry.nextRead = now() + 60000; throw new Error('Preview unavailable');
      } finally { entry.inFlight = undefined; }
    })();
    cache.set(fullName, entry);
    if (cache.size > 32) cache.delete(cache.keys().next().value);
    return entry.inFlight;
  };
}
export const getRepositoryPreview = createPreviewService();
