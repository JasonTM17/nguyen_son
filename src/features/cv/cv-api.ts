export type CvMetadata = { filename: string; size: number; updatedAt: string };
export type CvDocument = CvMetadata & { id: string; published: boolean };
export type AdminStatus = { initialized: boolean; authenticated: boolean; cv: CvMetadata | null; username?: string; revision?: string; csrf?: string; documents?: CvDocument[] };
export async function cvRequest<T>(body?: object): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30000);
  const uncertain = 'Chưa nhận được phản hồi. Hãy tải lại trang để kiểm tra trạng thái trước khi gửi lại.';
  try {
    const response = await fetch('/api/cv-admin', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal,
      ...(body ? { method: 'POST', headers: { 'Content-Type': 'application/json', ...('csrf' in body && typeof body.csrf === 'string' ? { 'X-CV-CSRF': body.csrf } : {}) }, body: JSON.stringify(body) } : {}) }).catch(() => { throw new Error(uncertain); });
    const data = await response.json().catch(() => { throw new Error(uncertain); });
    if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : uncertain);
    return data;
  } finally { window.clearTimeout(timeout); }
}
export function pdfBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Không đọc được file PDF.'));
    reader.readAsDataURL(file);
  });
}
