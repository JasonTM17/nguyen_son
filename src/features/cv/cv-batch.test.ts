import { expect, it, vi } from 'vitest';
import { uploadCvBatch } from './cv-batch';
import type { AdminStatus } from './cv-api';
const files = () => ['VI.pdf', 'EN.pdf', 'JA.pdf'].map(name => new File(['%PDF-1.7\n%%EOF'], name));
const status = (revision: string): AdminStatus => ({ initialized: true, authenticated: true, revision, csrf: 'csrf-' + revision, cv: null, documents: [] });
it('uploads all selected files sequentially with fresh revision/CSRF before each next write', async () => {
  let revision = 1, active = 0, maximum = 0;
  const revisions: string[] = [];
  const send = vi.fn(async (body: object) => { revisions.push((body as { revision: string }).revision); active++; maximum = Math.max(maximum, active); await Promise.resolve(); revision++; active--; });
  const result = await uploadCvBatch(files(), { readStatus: async () => status(String(revision)), send, encode: async () => 'pdf', progress: () => {} });
  expect(result.error).toBeUndefined(); expect(result.rows.map(row => row.state)).toEqual(['done','done','done']); expect(maximum).toBe(1);
  expect(revisions).toEqual(['1','2','3']);
});
it('keeps completed files and stops without retrying an uncertain commit or starting later files', async () => {
  let sends = 0;
  const result = await uploadCvBatch(files(), { readStatus: async () => status('rev'), send: async () => { if (++sends === 2) throw new Error('timeout'); }, encode: async () => 'pdf', progress: () => {} });
  expect(sends).toBe(2); expect(result.rows.map(row => row.state)).toEqual(['done','check','waiting']); expect(result.error).toContain('được giữ nguyên');
});
it('validates per-file size and library capacity before sending, and rejects expired sessions', async () => {
  const send = vi.fn(async () => {}); const dependencies = { readStatus: async () => status('1'), send, encode: async () => 'pdf', progress: () => {} };
  expect((await uploadCvBatch([new File(['x'], 'bad.exe')], dependencies)).error).toContain('PDF');
  expect((await uploadCvBatch(files(), { ...dependencies, readStatus: async () => ({ ...status('1'), documents: Array.from({ length: 19 }, () => ({ id:'id',filename:'x.pdf',size:1,updatedAt:'2026-11-01',published:false })) }) })).error).toContain('1 bản');
  expect((await uploadCvBatch(files(), { ...dependencies, readStatus: async () => ({ initialized:true,authenticated:false,cv:null }) })).error).toContain('hết hạn'); expect(send).not.toHaveBeenCalled();
});
