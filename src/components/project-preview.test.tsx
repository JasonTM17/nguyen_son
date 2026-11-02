import { act, cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ProjectPreview } from './project-preview';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it('marks retained images stale after refresh failure and expires them during an outage', async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-01T00:00:00Z'));
  const fullName = 'JasonTM17/Future_Project';
  const data = { fullName, verifiedAt: new Date().toISOString(), stale: false, preview: { imageUrl: `https://raw.githubusercontent.com/${fullName}/HEAD/home.png?v=1`, sourceUrl: `https://github.com/${fullName}/blob/HEAD/home.png` } };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: true, json: async () => data }).mockRejectedValue(new Error('offline')));
  const { container } = render(<ProjectPreview fullName={fullName} repositoryName="Future Project" />);
  await act(async () => {});
  expect(container.querySelector('img')).toHaveAttribute('src', data.preview.imageUrl);
  await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
  expect(container.querySelector('figcaption')).toHaveTextContent(/Saved repository image/);
  await act(async () => { await vi.advanceTimersByTimeAsync(3540001); });
  expect(container.querySelector('img')).not.toBeInTheDocument();
  expect(container.querySelector('a')).toHaveAttribute('href', `https://github.com/${fullName}`);
});
