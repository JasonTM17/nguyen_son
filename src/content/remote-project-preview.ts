export type RemoteProjectPreview = { fullName: string; verifiedAt: string; stale: boolean; preview: { imageUrl: string; sourceUrl: string } | null };
const identity = (name: string) => /^[A-Za-z0-9-]+\/(?!\.{1,2}$)[A-Za-z0-9_.-]{1,100}$/.test(name);
export function safeRemotePreview(value: unknown, fullName: string, now = Date.now()): RemoteProjectPreview | null {
  if (!identity(fullName) || !value || typeof value !== 'object') return null;
  const item = value as RemoteProjectPreview;
  const age = now - Date.parse(item.verifiedAt);
  if (item.fullName !== fullName || typeof item.stale !== 'boolean' || !Number.isFinite(age) || age < -60000 || age > 3600000) return null;
  if (item.preview === null) return item;
  try {
    const image = new URL(item.preview.imageUrl), source = new URL(item.preview.sourceUrl);
    if ([image, source].some(url => url.protocol !== 'https:' || url.username || url.password || url.port || url.hash || /%(?:2f|5c|2e|00)/i.test(url.pathname))) return null;
    if (image.search && (!/^\?v=\d{1,13}$/.test(image.search))) return null;
    if (source.search) return null;
    const attachment = image.hostname === 'github.com' && /^\/user-attachments\/assets\/[a-f0-9-]{36}$/i.test(image.pathname);
    if (attachment) return source.hostname === 'github.com' && source.pathname === image.pathname ? item : null;
    if (image.hostname !== 'raw.githubusercontent.com' || !image.pathname.startsWith(`/${fullName}/`) || !/\.(?:png|jpe?g|webp|avif|gif)$/i.test(image.pathname)) return null;
    const suffix = image.pathname.slice(fullName.length + 2);
    return suffix.split('/').length >= 2 && source.href === `https://github.com/${fullName}/blob/${suffix}` ? item : null;
  } catch { return null; }
}
