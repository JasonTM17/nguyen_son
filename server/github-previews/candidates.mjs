import { load } from 'cheerio/slim';
export const validRepository = name => typeof name === 'string' && /^[A-Za-z0-9-]+\/(?!\.{1,2}$)[A-Za-z0-9_.-]{1,100}$/.test(name);
const raster = /\.(?:png|jpe?g|webp|avif|gif)$/i;
const ignored = /(?:^|[\s/_.-])(?:logo|badge|icon|avatar|favicon|sprite|shield|license|workflow)(?:$|[\s/_.-])/i;
function safeSegments(path) {
  try { return path.split('/').filter(Boolean).every(part => { const decoded = decodeURIComponent(part); return decoded !== '.' && decoded !== '..' && !/[\\/\x00-\x1f\x7f]/.test(decoded); }); } catch { return false; }
}
export function repositoryImage(value, fullName) {
  if (!validRepository(fullName) || typeof value !== 'string' || value.length > 1800 || /[\\\x00-\x1f]/.test(value)) return null;
  try {
    // Reject traversal before URL normalization can erase it.
    value = value.replace(/^(?:\.\/)+/, '');
    if (!safeSegments(value.split(/[?#]/)[0])) return null;
    const base = `https://raw.githubusercontent.com/${fullName}/HEAD/README.md`;
    const url = new URL(value.replace(/^\.\//, ''), base);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.hash) return null;
    if (url.hostname === 'github.com' && /^\/user-attachments\/assets\/[a-f0-9-]{36}$/i.test(url.pathname) && !url.search) return { imageUrl: url.href, sourceUrl: url.href, attachment: true };
    if (url.hostname === 'github.com' && url.pathname.startsWith(`/${fullName}/blob/`)) {
      if (url.search && url.search !== '?raw=true' && url.search !== '?raw=1') return null;
      url.hostname = 'raw.githubusercontent.com'; url.pathname = url.pathname.replace(`/${fullName}/blob/`, `/${fullName}/`); url.search = '';
    }
    if (url.hostname !== 'raw.githubusercontent.com' || !url.pathname.startsWith(`/${fullName}/`) || url.search || !safeSegments(url.pathname) || !raster.test(url.pathname)) return null;
    const suffix = url.pathname.slice(fullName.length + 2);
    if (suffix.split('/').length < 2) return null;
    return { imageUrl: url.href, sourceUrl: `https://github.com/${fullName}/blob/${suffix}`, attachment: false };
  } catch { return null; }
}
export function imageScore(path, alt = '') {
  const text = `${path} ${alt}`;
  if (ignored.test(text) || !raster.test(path.split(/[?#]/)[0]) && !path.includes('/user-attachments/assets/')) return -1;
  let score = 0;
  if (/(?:^|[/_. -])cover(?:[_. -]|$)/i.test(text)) score += 150;
  if (/screenshot|screens\/|showcase|repo-tours|portfolio\/previews/i.test(text)) score += 35;
  if (/(?:home|dashboard|landing|overview|public-01|trang chu|giao dien)/i.test(text)) score += 45;
  if (/preview|interface|screen/i.test(text)) score += 20;
  if (/github-hero|thumbnail|demo\/photos|mapping|settings|training/i.test(text)) score -= 15;
  return score;
}
export function readmeCandidates(markdown, fullName) {
  const items = [];
  const add = (src, alt, small = false) => {
    if (typeof src !== 'string') return;
    const image = repositoryImage(src, fullName); const score = imageScore(src, alt);
    if (!small && image && score >= 0) items.push({ ...image, score });
  };
  const inline = /!\[([^\]]*)\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g;
  for (const match of markdown.matchAll(inline)) add(match[2] ?? match[3], match[1]);
  const definitions = new Map([...markdown.matchAll(/^\s*\[([^\]]+)\]:\s*<?([^\s>]+)>?/gm)].map(match => [match[1].toLowerCase(), match[2]]));
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\[([^\]]*)\]/g)) add(definitions.get((match[2] || match[1]).toLowerCase()), match[1]);
  const $ = load(markdown);
  $('img').each((_, element) => { const node = $(element); const width = Number(node.attr('width')), height = Number(node.attr('height')); add(node.attr('src'), node.attr('alt') ?? '', width > 0 && width < 200 || height > 0 && height < 100); });
  return [...new Map(items.sort((a,b) => b.score - a.score).map(item => [item.imageUrl, item])).values()].slice(0, 8);
}
