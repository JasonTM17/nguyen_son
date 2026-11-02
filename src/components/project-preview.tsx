import { useEffect, useState } from 'react';
import previews from '../content/project-previews.json';
import { usePortfolioLanguage } from '../i18n/portfolio-language-context';
import { ProjectArtwork } from './project-artwork';
import { safeRemotePreview, type RemoteProjectPreview } from '../content/remote-project-preview';
export function ProjectPreview({ fullName, repositoryName }: { fullName: string; repositoryName: string }) {
  const { language } = usePortfolioLanguage();
  const [failedSources, setFailedSources] = useState<ReadonlySet<string>>(() => new Set());
  const [remote, setRemote] = useState<RemoteProjectPreview | null>(null);
  useEffect(() => {
    if (!remote) return;
    const timeout = window.setTimeout(() => setRemote(current => current === remote ? null : current), Math.max(0, Date.parse(remote.verifiedAt) + 3600001 - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [remote]);
  useEffect(() => {
    let disposed = false, pending = false;
    let active: AbortController | undefined;
    async function refresh() {
      if (disposed || pending || document.visibilityState === 'hidden') return;
      pending = true; const controller = new AbortController(); active = controller;
      const timeout = window.setTimeout(() => controller.abort(), 18000);
      try {
        const response = await fetch('/api/project-preview?repo=' + encodeURIComponent(fullName), { signal: controller.signal });
        if (!response.ok) throw new Error('Preview unavailable');
        const value = safeRemotePreview(await response.json(), fullName);
        if (!value) throw new Error('Invalid preview');
        if (!disposed) setRemote(value);
      } catch {
        if (!disposed) setRemote(previous => {
          const retained = safeRemotePreview(previous, fullName);
          return retained ? { ...retained, stale: true } : null;
        });
      }
      finally { pending = false; window.clearTimeout(timeout); }
    }
    void refresh(); const visible = () => void refresh();
    const interval = window.setInterval(visible, 60000); window.addEventListener('focus', visible); document.addEventListener('visibilitychange', visible);
    return () => { disposed = true; active?.abort(); window.clearInterval(interval); window.removeEventListener('focus', visible); document.removeEventListener('visibilitychange', visible); };
  }, [fullName]);
  const preview = previews.find(item => item.fullName === fullName);
  const discovered = remote?.fullName === fullName && remote.preview && !failedSources.has(remote.preview.imageUrl) ? remote.preview : null;
  const src = discovered?.imageUrl ?? (preview && !failedSources.has(preview.src) ? preview.src : undefined);
  const repoHref = `https://github.com/${fullName}`;
  const linkLabel = language === 'vi' ? `Mở repository ${repositoryName}` : `Open ${repositoryName} repository`;
  if (!src) return <a className="project-preview__link" href={repoHref} aria-label={linkLabel} target="_blank" rel="noreferrer"><ProjectArtwork fullName={fullName} repositoryName={repositoryName} /></a>;
  return <figure className="project-preview">
    <a className="project-preview__link" href={repoHref} aria-label={linkLabel} target="_blank" rel="noreferrer"><img src={src} alt={discovered ? language === 'vi' ? `Ảnh dự án ${repositoryName} từ GitHub.` : `${repositoryName} project image from GitHub.` : preview!.alt[language]} loading="lazy" decoding="async" referrerPolicy="no-referrer" width="1100" height="740" onError={() => setFailedSources(previous => new Set([...previous, src].slice(-32)))} /></a>
    <figcaption><span>{remote?.stale && discovered ? language === 'vi' ? 'Ảnh đã lưu từ repository' : 'Saved repository image' : language === 'vi' ? 'Ảnh dự án từ repository' : 'Project image from repository'}</span><a href={discovered?.sourceUrl ?? preview!.sourceHref} target="_blank" rel="noreferrer">{language === 'vi' ? 'Xem ảnh gốc' : 'View source image'}<span aria-hidden="true"> ↗</span></a></figcaption>
  </figure>;
}
