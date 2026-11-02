import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import CvAdmin from './cv-admin';
import { CvLibrary } from './cv-library';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); window.history.replaceState(null, '', '/'); });
const mockResponse = (data: unknown, ok = true) => ({ ok, json: async () => data });
it('one-time fragment is removed and setup submits chosen credentials only to JSON endpoint', async () => {
  window.location.hash = '#admin-cv?setup=' + 'x'.repeat(43);
  let initialized = false;
  const fetcher = vi.fn(async (_url, options) => {
    if (options?.method === 'POST') { initialized = true; return mockResponse({ ok: true }); }
    return mockResponse({ initialized, authenticated: false, cv: null });
  }); vi.stubGlobal('fetch', fetcher);
  render(<CvAdmin />);
  await screen.findByRole('button', { name: 'Tạo tài khoản' });
  expect(window.location.pathname).toBe('/admin');
  expect(window.location.hash).toBe('');
  fireEvent.change(screen.getByLabelText('Tài khoản'), { target: { value: 'my-owner' } });
  fireEvent.change(screen.getByLabelText('Mật khẩu'), { target: { value: 'chosen long password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
  await screen.findByRole('button', { name: 'Đăng nhập' });
  const request = fetcher.mock.calls.find(call => call[1]?.method === 'POST');
  expect(JSON.parse(request![1].body).setupToken).toBe('x'.repeat(43));
  expect(request![0]).toBe('/api/cv-admin');
});
it('password visibility toggle preserves input and never submits login', async () => {
  const fetcher = vi.fn(async () => mockResponse({ initialized: true, authenticated: false, cv: null })); vi.stubGlobal('fetch', fetcher);
  window.history.replaceState(null, '', '/admin'); render(<CvAdmin />);
  const password = await screen.findByLabelText('Mật khẩu'); fireEvent.change(password, { target: { value: 'chosen password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
  expect(password).toHaveAttribute('type', 'text'); expect(password).toHaveValue('chosen password');
  fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
  expect(password).toHaveAttribute('type', 'password'); expect(fetcher.mock.calls).toHaveLength(1);
});
it('public admin URL cannot register without a private setup capability', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => mockResponse({ initialized: false, authenticated: false, cv: null })));
  render(<CvAdmin />); await screen.findByText(/chưa được kích hoạt/);
  expect(screen.queryByRole('button', { name: 'Tạo tài khoản' })).not.toBeInTheDocument();
});
it('authenticated dashboard handles upload failure without hiding current CV', async () => {
  const status = { initialized: true, authenticated: true, username: 'owner', revision: '1', csrf: 'csrf', documents: [], cv: { filename: 'current.pdf', size: 100, updatedAt: '2026-11-01T00:00:00Z' } };
  const fetcher = vi.fn(async (_url, options) => options?.method === 'POST' ? mockResponse({ error: 'File không hợp lệ' }, false) : mockResponse(status));
  vi.stubGlobal('fetch', fetcher); render(<CvAdmin />);
  await screen.findByText('current.pdf');
  fireEvent.change(screen.getByLabelText('Chọn file PDF'), { target: { files: [new File(['bad'], 'new.pdf', { type: 'application/pdf' })] } });
  fireEvent.submit(screen.getByLabelText('Chọn file PDF').closest('form')!);
  await screen.findByRole('alert'); expect(screen.getByText('current.pdf')).toBeInTheDocument();
  await waitFor(() => expect(fetcher.mock.calls.some(c => c[1]?.headers?.['X-CV-CSRF'] === 'csrf')).toBe(true));
  expect(JSON.parse(fetcher.mock.calls.find(c => c[1]?.method === 'POST')![1].body).action).toBe('add');
});
const documents = [
  { id: 'a'.repeat(8) + '-aaaa-aaaa-aaaa-' + 'a'.repeat(12), filename: 'Public.pdf', size: 100, updatedAt: '2026-11-01T00:00:00Z', published: true },
  { id: 'b'.repeat(8) + '-bbbb-bbbb-bbbb-' + 'b'.repeat(12), filename: 'Private.pdf', size: 200, updatedAt: '2026-11-01T00:00:00Z', published: false },
];
it('per-document rename targets the selected id and leaves the PDF unchanged', async () => {
  const action = vi.fn(async () => true); render(<CvLibrary documents={documents} busy={false} onAction={action} />);
  const row = within(screen.getByRole('article', { name: 'Private.pdf' }));
  fireEvent.click(row.getByRole('button', { name: 'Đổi tên' }));
  fireEvent.change(row.getByLabelText('Tên CV mới'), { target: { value: 'Java English' } });
  fireEvent.click(row.getByRole('button', { name: 'Lưu tên' }));
  await waitFor(() => expect(action).toHaveBeenCalledWith({ action: 'rename', id: documents[1].id, filename: 'Java English.pdf' }, expect.any(String)));
});
it('publication is explicit and published document cannot be deleted in UI', () => {
  const action = vi.fn(async () => true); render(<CvLibrary documents={documents} busy={false} onAction={action} />);
  const published = within(screen.getByRole('article', { name: 'Public.pdf' })), saved = within(screen.getByRole('article', { name: 'Private.pdf' }));
  expect(published.getByRole('button', { name: 'Xóa' })).toBeDisabled();
  expect(saved.getByRole('link', { name: 'Tải PDF ↓' })).toHaveAttribute('href', '/api/cv-admin?download=' + documents[1].id);
  fireEvent.click(saved.getByRole('button', { name: 'Công khai' }));
  expect(action).toHaveBeenCalledWith({ action: 'publish', id: documents[1].id }, expect.any(String));
});
