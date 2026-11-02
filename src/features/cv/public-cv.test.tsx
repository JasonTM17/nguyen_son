import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { afterEach, it, expect, vi } from 'vitest';
import { PublicCv } from './public-cv';
import { PublicCvProvider } from './public-cv-provider';
import type { CvMetadata } from './cv-api';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('shares a single metadata read for hero/footer and removes both links after unpublish', async () => {
  const payload: { cv: CvMetadata | null } = { cv: { filename: 'cv.pdf', size: 123, updatedAt: '2026-11-01T00:00:00Z' } };
  const fetcher = vi.fn(async () => ({ ok: true, json: async () => payload })); vi.stubGlobal('fetch', fetcher);
  render(<PublicCvProvider><PublicCv /><PublicCv /></PublicCvProvider>);
  await waitFor(() => expect(screen.getAllByRole('link', { name: /Download CV/ })).toHaveLength(2));
  expect(fetcher).toHaveBeenCalledTimes(1);
  payload.cv = null; window.dispatchEvent(new Event('focus'));
  await waitFor(() => expect(screen.queryAllByRole('link', { name: /Download CV/ })).toHaveLength(0));
});
it('does not show a download for an unavailable or invalid public document', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ cv: { filename: 'bad.pdf', size: 1, updatedAt: 'invalid' } }) })));
  const { container } = render(<PublicCvProvider><PublicCv /></PublicCvProvider>);
  await waitFor(() => expect(container.querySelector('a')).toBe(null));
});
