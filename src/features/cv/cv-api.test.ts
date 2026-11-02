import { afterEach, expect, it, vi } from 'vitest';
import { cvRequest } from './cv-api';
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
it('bounds stalled requests and reports uncertainty rather than claiming a mutation failed', async () => {
  vi.useFakeTimers(); let signal: AbortSignal | undefined;
  vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
    signal = options.signal; signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  })));
  const request = cvRequest({ action: 'publish', csrf: 'test' }); const rejected = expect(request).rejects.toThrow(/kiểm tra trạng thái trước khi gửi lại/);
  await vi.advanceTimersByTimeAsync(30000); await rejected;
  expect(signal?.aborted).toBe(true); expect(vi.getTimerCount()).toBe(0);
});
it('non-JSON or network failures do not expose proxy errors to the form', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => { throw new SyntaxError('private proxy detail'); } })));
  await expect(cvRequest()).rejects.toThrow(/Chưa nhận được phản hồi/);
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('internal address'); }));
  await expect(cvRequest()).rejects.toThrow(/Chưa nhận được phản hồi/);
});
it('preserves server validation and CSRF, and clears successful request timeout', async () => {
  vi.useFakeTimers(); let sent: RequestInit | undefined;
  const fetcher = vi.fn(async (url: string, options: RequestInit) => { expect(url).toBe('/api/cv-admin'); sent = options; return { ok: false, json: async () => ({ error: 'Phiên đã hết hạn' }) }; }); vi.stubGlobal('fetch', fetcher);
  await expect(cvRequest({ action: 'rename', csrf: 'safe-csrf' })).rejects.toThrow('Phiên đã hết hạn');
  expect(sent?.credentials).toBe('same-origin'); expect(sent?.headers).toMatchObject({ 'X-CV-CSRF': 'safe-csrf' }); expect(vi.getTimerCount()).toBe(0);
});
