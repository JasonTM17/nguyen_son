import { useEffect, useRef, useState, type FormEvent } from 'react';
import { cvRequest, pdfBase64, type AdminStatus } from './cv-api';
import { CvLibrary } from './cv-library';
import { ADMIN_PATH, cvSetupToken } from './cv-route';
import { PasswordField } from './password-field';
import { uploadCvBatch, type CvBatchRow } from './cv-batch';
import './cv.css';

export default function CvAdmin() {
  const [setupToken, setSetupToken] = useState(() => cvSetupToken(window.location));
  const [status, setStatus] = useState<AdminStatus>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [batch, setBatch] = useState<CvBatchRow[]>([]);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);
  async function refresh() { const next = await cvRequest<AdminStatus>(); setStatus(next); return next; }
  useEffect(() => {
    document.title = 'Quản lý CV · Nguyễn Sơn';
    document.documentElement.lang = 'vi';
    // Fragment capability never reaches the server, referrer, localStorage or API URL.
    window.history.replaceState(null, '', ADMIN_PATH);
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.content;
    if (robots) robots.content = 'noindex,nofollow,nosnippet';
    let cancelled = false;
    cvRequest<AdminStatus>().then(value => { if (!cancelled) setStatus(value); }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; if (robots && previousRobots !== undefined) robots.content = previousRobots; };
  }, []);
  async function perform(body: Record<string, unknown>, message: string) {
    setBusy(true); setError(''); setNotice('');
    try {
      await cvRequest({ ...body, revision: status?.revision, csrf: status?.csrf });
      await refresh(); setNotice(message);
      if (body.action === 'setup') setSetupToken('');
      setConfirmRemove(false);
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Chưa thể xử lý yêu cầu.'); await refresh().catch(() => {}); return false; }
    finally { setBusy(false); }
  }
  function authSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    void perform({ ...values, action: status?.initialized ? 'login' : 'setup', setupToken }, status?.initialized ? 'Đã đăng nhập.' : 'Đã tạo tài khoản. Bạn có thể đăng nhập ngay.').then(ok => { if (ok) form.reset(); });
  }
  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!files.length || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await uploadCvBatch(files, { readStatus: refresh, send: body => cvRequest(body), encode: pdfBase64, progress: setBatch });
      const saved = result.rows.filter(row => row.state === 'done').length;
      if (saved) setNotice(`Đã thêm ${saved}/${files.length} bản CV vào thư viện riêng. CV đang công khai không thay đổi.`);
      if (result.error) setError(result.error);
      setFiles([]); if (uploadRef.current) uploadRef.current.value = '';
      await refresh().catch(() => {});
    } finally { setBusy(false); }
  }
  return <main className="cv-admin">
    <a className="text-link" href="/">← Về portfolio</a>
    <header className="cv-admin__heading"><p className="eyebrow">KHÔNG GIAN CỦA BẠN</p><h1>Quản lý CV</h1><p>Giữ hồ sơ của bạn luôn sẵn sàng cho cơ hội tiếp theo.</p></header>
    {error && <p className="cv-alert cv-alert--error" role="alert">{error}</p>}
    {notice && <p className="cv-alert" role="status">{notice}</p>}
    {!status ? <section className="cv-card"><p>{error ? 'Chưa tải được trạng thái quản trị.' : 'Đang kết nối…'}</p>{error && <button className="button" onClick={() => { setError(''); void refresh().catch(e => setError(e.message)); }}>Thử lại</button>}</section>
      : !status.authenticated ? <section className="cv-card">
        <h2>{status.initialized ? 'Chào bạn trở lại' : 'Thiết lập tài khoản'}</h2>
        {!status.initialized && !setupToken ? <p>Trang quản trị chưa được kích hoạt. Hãy dùng liên kết thiết lập riêng được gửi cho chủ portfolio.</p> : <>
          <p>{status.initialized ? 'Đăng nhập để cập nhật CV của bạn.' : 'Tự chọn tài khoản và mật khẩu. Liên kết thiết lập chỉ dùng được một lần.'}</p>
          <form onSubmit={authSubmit} className="cv-form"><fieldset disabled={busy}>
            <label>Tài khoản<input name="username" required minLength={3} maxLength={40} pattern="[a-zA-Z0-9_.\-]+" autoComplete="username" autoCapitalize="none" spellCheck={false} /></label>
            <PasswordField label="Mật khẩu" name="password" minLength={status.initialized ? 1 : 15} autoComplete={status.initialized ? 'current-password' : 'new-password'} />
            {!status.initialized && <small>Dùng 15–128 ký tự. Bạn có thể dùng một câu dài dễ nhớ.</small>}
            <button className="button button--primary" type="submit">{busy ? 'Đang xử lý…' : status.initialized ? 'Đăng nhập' : 'Tạo tài khoản'}</button>
          </fieldset></form>
        </>}
      </section> : <>
        <section className="cv-card cv-account"><div><p className="eyebrow">ĐÃ ĐĂNG NHẬP</p><strong>{status.username}</strong><p>Mỗi lần đăng nhập sẽ thay thế phiên trước.</p></div><button className="button" disabled={busy} onClick={() => void perform({ action: 'logout' }, 'Đã đăng xuất.')}>Đăng xuất</button></section>
        <section className="cv-card"><h2>CV đang công khai</h2>{status.cv ? <>
          <p className="cv-filename">{status.cv.filename}</p><p>{Math.ceil(status.cv.size / 1024)} KB · Cập nhật {new Date(status.cv.updatedAt).toLocaleString('vi-VN')}</p>
          <div className="cv-actions"><a className="button" href="/api/cv?download=1">Tải bản hiện tại ↓</a><button className="button" disabled={busy} onClick={() => setConfirmRemove(true)}>Ẩn CV</button></div>
          {confirmRemove && <div className="cv-confirm"><p>Ẩn CV khỏi portfolio? Bản này vẫn được giữ trong thư viện riêng.</p><div className="cv-actions"><button className="button" disabled={busy} onClick={() => void perform({ action: 'remove' }, 'Đã ẩn CV công khai.')}>Xác nhận ẩn</button><button className="button" disabled={busy} onClick={() => setConfirmRemove(false)}>Giữ CV</button></div></div>}
        </> : <p>Bạn chưa công khai CV nào. Chọn một bản trong thư viện để hiển thị trên portfolio.</p>}</section>
        <CvLibrary documents={status.documents ?? []} busy={busy} onAction={perform} />
        <section className="cv-card"><h2>Thêm bản CV</h2><p>PDF tối đa 3 MB, lưu tối đa 20 bản. Bản mới được lưu riêng và không thay đổi CV đang công khai.</p>
          <form className="cv-form" onSubmit={upload}><fieldset disabled={busy}><label>Chọn file PDF<input ref={uploadRef} type="file" accept=".pdf,application/pdf" multiple required onChange={e => { setFiles(Array.from(e.target.files ?? [])); setBatch([]); }} /></label>
            <small>Có thể chọn nhiều PDF cùng lúc. Mỗi file được tải riêng, tối đa 3 MB/file.</small>
            {files.length > 0 && <ul className="cv-batch-list">{files.map((file, index) => <li key={index}>{file.name} · {Math.ceil(file.size / 1024)} KB</li>)}</ul>}
            <button className="button button--primary" type="submit" disabled={!files.length || busy || (status.documents?.length ?? 0) >= 20}>{busy ? 'Đang tải lần lượt…' : files.length > 1 ? `Thêm ${files.length} CV vào thư viện` : 'Thêm vào thư viện'}</button>
          </fieldset></form></section>
        {batch.length > 0 && <section className="cv-card" aria-label="Tiến độ tải CV"><h2>Tiến độ tải lên</h2><ol className="cv-batch-list" aria-live="polite">{batch.map((row, index) => <li key={index}><strong>{row.name}</strong><span>{({ waiting: 'Chưa tải', uploading: 'Đang tải…', done: 'Đã lưu', check: 'Cần kiểm tra' })[row.state]}</span>{row.message && <small>{row.message}</small>}</li>)}</ol></section>}
        <details className="cv-card"><summary>Đổi tài khoản / mật khẩu</summary><p>Nhập mật khẩu hiện tại để xác nhận. Sau khi lưu, mọi phiên đăng nhập cũ sẽ kết thúc.</p><form className="cv-form" onSubmit={e => {
          e.preventDefault(); const form = e.currentTarget; const values = Object.fromEntries(new FormData(form));
          if (values.password !== values.confirmPassword) { setError('Hai mật khẩu mới chưa khớp.'); return; }
          void perform({ action: 'credentials', ...values }, 'Đã đổi thông tin. Vui lòng đăng nhập lại.').then(ok => { if (ok) form.reset(); });
        }}><fieldset disabled={busy}><PasswordField label="Mật khẩu hiện tại" name="currentPassword" autoComplete="current-password" />
          <label>Tài khoản mới<input name="username" defaultValue={status.username} required minLength={3} maxLength={40} pattern="[a-zA-Z0-9_.\-]+" autoComplete="username" /></label>
          <PasswordField label="Mật khẩu mới" name="password" minLength={15} autoComplete="new-password" />
          <PasswordField label="Nhập lại mật khẩu mới" name="confirmPassword" minLength={15} autoComplete="new-password" />
          <button className="button" type="submit">Lưu và đăng xuất</button>
        </fieldset></form></details>
      </>}
  </main>;
}
