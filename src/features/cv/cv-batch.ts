import type { AdminStatus } from './cv-api';
export type CvBatchRow = { name: string; state: 'waiting' | 'uploading' | 'done' | 'check'; message?: string };
type Dependencies = {
  readStatus: () => Promise<AdminStatus>;
  send: (body: object) => Promise<unknown>;
  encode: (file: File) => Promise<string>;
  progress: (rows: CvBatchRow[]) => void;
};
export async function uploadCvBatch(files: File[], deps: Dependencies): Promise<{ rows: CvBatchRow[]; error?: string }> {
  const rows: CvBatchRow[] = files.map(file => ({ name: file.name, state: 'waiting' }));
  const emit = () => deps.progress(rows.map(row => ({ ...row })));
  emit();
  const invalid = files.map((file, index) => !file.size || file.size > 3 * 1024 * 1024 || !/\.pdf$/i.test(file.name) ? index : -1).filter(index => index >= 0);
  if (!files.length || invalid.length) { for (const index of invalid) { rows[index].state = 'check'; rows[index].message = 'File cần là PDF, lớn hơn 0 byte và tối đa 3 MB.'; } emit(); return { rows, error: 'Mỗi file cần là PDF, lớn hơn 0 byte và tối đa 3 MB.' }; }
  let status: AdminStatus;
  try { status = await deps.readStatus(); }
  catch { return { rows, error: 'Chưa đọc được trạng thái thư viện. Hãy tải lại trang trước khi thử.' }; }
  if (!status.authenticated || !status.revision || !status.csrf) return { rows, error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  const remaining = 20 - (status.documents?.length ?? 0);
  if (files.length > remaining) return { rows, error: `Thư viện còn chỗ cho ${Math.max(0, remaining)} bản CV. Hãy chọn ít file hơn.` };
  for (let index = 0; index < files.length; index++) {
    const row = rows[index]; row.state = 'uploading'; emit();
    let acknowledged = false;
    try {
      const data = await deps.encode(files[index]);
      await deps.send({ action: 'add', filename: files[index].name, data, revision: status.revision, csrf: status.csrf });
      acknowledged = true; row.state = 'done'; emit();
      // A fresh revision is required before the next write. Never reuse a render's stale closure.
      status = await deps.readStatus();
      if (!status.authenticated || !status.revision || !status.csrf) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng đăng nhập lại.');
    } catch (error) {
      if (!acknowledged) row.state = 'check';
      row.message = acknowledged ? 'Đã lưu; chưa đọc lại được trạng thái.' : error instanceof Error ? error.message : 'Cần kiểm tra trạng thái file.';
      emit();
      return { rows, error: 'Đã dừng lượt tải lên. Các file đã lưu được giữ nguyên; hãy tải lại thư viện và kiểm tra file cần xác nhận trước khi gửi lại.' };
    }
  }
  return { rows };
}
