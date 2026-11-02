import { useEffect, useRef, useState, type FormEvent } from 'react';
import { pdfBase64, type CvDocument } from './cv-api';
type Props = { documents: CvDocument[]; busy: boolean; onAction: (body: Record<string, unknown>, message: string) => Promise<boolean> };
export function CvLibrary({ documents, busy, onAction }: Props) {
  const [editing, setEditing] = useState<{ id: string; mode: 'rename' | 'replace' | 'delete' }>();
  const [error, setError] = useState('');
  const [preparing, setPreparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const locked = busy || preparing;
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  function edit(id: string, mode: 'rename' | 'replace' | 'delete') { setError(''); setEditing({ id, mode }); }
  async function save(event: FormEvent<HTMLFormElement>, doc: CvDocument) {
    event.preventDefault(); setError('');
    const form = new FormData(event.currentTarget);
    if (editing?.mode === 'rename') {
      const raw = String(form.get('filename') ?? '').trim();
      const filename = /\.pdf$/i.test(raw) ? raw : raw + '.pdf';
      if (await onAction({ action: 'rename', id: doc.id, filename }, 'Đã đổi tên CV.')) setEditing(undefined);
    } else if (editing?.mode === 'replace') {
      const file = form.get('pdf');
      if (!(file instanceof File) || !file.size || file.size > 3 * 1024 * 1024 || !/\.pdf$/i.test(file.name)) { setError('Chọn file PDF tối đa 3 MB.'); return; }
      setPreparing(true);
      try {
        const data = await pdfBase64(file);
        if (await onAction({ action: 'replace', id: doc.id, filename: file.name, data }, 'Đã thay PDF cho bản CV đã chọn.')) setEditing(undefined);
      } catch { setError('Không đọc được file PDF.'); }
      finally { setPreparing(false); }
    }
  }
  return <section className="cv-card cv-library" aria-labelledby="cv-library-heading">
    <div className="cv-library__heading"><h2 id="cv-library-heading">Thư viện CV</h2><span>{documents.length} / 20 bản</span></div>
    <p>Các bản đã lưu chỉ mình bạn xem được. Chọn “Công khai” để đưa một bản lên portfolio.</p>
    {!documents.length && <p>Thêm CV đầu tiên ở bên dưới để bắt đầu.</p>}
    <div className="cv-library__list">{documents.map(doc => <article className="cv-document" key={doc.id} aria-label={doc.filename}>
      <span className={`cv-document__badge${doc.published ? ' cv-document__badge--public' : ''}`}>{doc.published ? 'Đang công khai' : 'Chỉ mình bạn'}</span>
      <h3 className="cv-filename">{doc.filename}</h3><p>{Math.ceil(doc.size / 1024)} KB · Cập nhật {new Date(doc.updatedAt).toLocaleString('vi-VN')}</p>
      <div className="cv-actions">
        <a className="button" href={'/api/cv-admin?download=' + encodeURIComponent(doc.id)}>Tải PDF ↓</a>
        <button className="button" disabled={locked} onClick={() => edit(doc.id, 'rename')}>Đổi tên</button>
        <button className="button" disabled={locked} onClick={() => edit(doc.id, 'replace')}>Thay PDF</button>
        {!doc.published && <button className="button button--primary" disabled={locked} onClick={() => void onAction({ action: 'publish', id: doc.id }, 'Đã chọn bản CV công khai.')}>Công khai</button>}
        <button className="button" disabled={locked || doc.published} onClick={() => edit(doc.id, 'delete')}>Xóa</button>
      </div>
      {editing?.id === doc.id && <div className="cv-document__edit">
        {editing.mode === 'delete' ? <><p>Xóa vĩnh viễn “{doc.filename}” khỏi thư viện?</p><div className="cv-actions"><button className="button" disabled={locked} onClick={() => void onAction({ action: 'delete', id: doc.id }, 'Đã xóa CV khỏi thư viện.').then(ok => { if (ok) setEditing(undefined); })}>Xác nhận xóa</button><button className="button" disabled={locked} onClick={() => setEditing(undefined)}>Hủy</button></div></>
          : <form className="cv-form" onSubmit={event => void save(event, doc)}><fieldset disabled={locked}>
            {editing.mode === 'rename' ? <label>Tên CV mới<input ref={inputRef} name="filename" defaultValue={doc.filename} required maxLength={120} /></label> : <>
              <p>{doc.published ? 'Bản này đang công khai. Lưu PDF mới sẽ cập nhật bản tải xuống trên portfolio.' : 'PDF mới sẽ thay đúng bản này và tiếp tục được lưu riêng.'}</p>
              <label>PDF thay thế<input ref={inputRef} name="pdf" type="file" accept=".pdf,application/pdf" required /></label></>}
            {error && <p className="cv-alert cv-alert--error" role="alert">{error}</p>}
            <div className="cv-actions"><button className="button button--primary" type="submit">{locked ? 'Đang lưu…' : editing.mode === 'rename' ? 'Lưu tên' : 'Lưu PDF thay thế'}</button><button className="button" type="button" onClick={() => setEditing(undefined)}>Hủy</button></div>
          </fieldset></form>}
      </div>}
    </article>)}</div>
  </section>;
}
