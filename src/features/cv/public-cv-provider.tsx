import { useEffect, useState, type ReactNode } from 'react';
import type { CvMetadata } from './cv-api';
import { PublicCvContext } from './public-cv-context';
export function PublicCvProvider({ children }: { children: ReactNode }) {
  const [cv, setCv] = useState<CvMetadata | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function refresh() {
      if (pending || document.visibilityState === 'hidden') return;
      pending = true;
      try {
        const response = await fetch('/api/cv', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (!controller.signal.aborted) setCv(data?.cv && typeof data.cv.filename === 'string' && Number.isFinite(data.cv.size) && Number.isFinite(Date.parse(data.cv.updatedAt)) ? data.cv : null);
      } catch { /* Leave last successful metadata while reconnecting; downloads always resolve live. */ }
      finally { pending = false; }
    }
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus); document.addEventListener('visibilitychange', onFocus);
    return () => { controller.abort(); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onFocus); };
  }, []);
  return <PublicCvContext value={cv}>{children}</PublicCvContext>;
}
