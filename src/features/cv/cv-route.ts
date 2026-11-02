export const ADMIN_PATH = '/admin';
type CvLocation = Pick<Location, 'pathname' | 'hash'>;
const legacyHash = (location: CvLocation) => location.pathname === '/' && /^#admin-cv(?:\?|$)/.test(location.hash);
export function isCvAdminLocation(location: CvLocation): boolean {
  return ['/admin', '/admin/', '/admin-cv', '/admin-cv/'].includes(location.pathname) || legacyHash(location);
}
export function cvSetupToken(location: CvLocation): string {
  if (!isCvAdminLocation(location)) return '';
  const params = legacyHash(location) ? location.hash.split('?')[1] : location.hash.slice(1);
  const token = new URLSearchParams(params).get('setup') ?? '';
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : '';
}
export function subscribeCvLocation(callback: () => void) {
  window.addEventListener('hashchange', callback);
  window.addEventListener('popstate', callback);
  return () => { window.removeEventListener('hashchange', callback); window.removeEventListener('popstate', callback); };
}
