import { createCvService } from './service.mjs';
import { createBlobStore } from './store.mjs';
export const COOKIE = '__Host-portfolio-cv';
export const MAX_BODY = 4 * 1024 * 1024 + 4096;
const messages = {
  credentials: 'Tên tài khoản cần 3–40 ký tự a-z, số, dấu . _ -; mật khẩu cần 15–128 ký tự.',
  pdf: 'Chọn file PDF hợp lệ, tối đa 3 MB.', unauthorized: 'Tài khoản, mật khẩu hoặc phiên đăng nhập không hợp lệ.',
  forbidden: 'Yêu cầu không được phép hoặc liên kết thiết lập đã hết hạn.', limited: 'Đã thử quá nhiều lần. Vui lòng đợi 15 phút.',
  conflict: 'Dữ liệu vừa thay đổi. Vui lòng tải lại và thử lại.', initialized: 'Tài khoản quản trị đã được thiết lập.',
  not_found: 'Chưa có CV công khai.', unavailable: 'Tạm thời chưa kết nối được kho CV. Vui lòng thử lại sau.',
  document_not_found: 'Không tìm thấy bản CV này. Vui lòng tải lại danh sách.',
  library_full: 'Thư viện đã có 20 bản CV. Hãy xóa bản không cần trước khi thêm.',
  filename: 'Tên CV cần kết thúc bằng .pdf, tối đa 120 ký tự và không chứa dấu / hoặc \\.',
  published_document: 'Hãy ẩn CV hoặc công khai một bản khác trước khi xóa bản này.',
};
export function createCvHandlers(service, origin) {
  const headers = (res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
  };
  const error = (res, e) => {
    console.error('CV Error:', e);
    return res.status(e.status ?? 503).json({
      error: messages[e.code] ?? messages.unavailable,
      detail: e?.message ?? String(e),
      name: e?.name ?? 'Error',
      code: e?.code,
      stack: e?.stack,
    });
  };
  const download = (response, result) => {
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', `attachment; filename="Nguyen-Son-CV.pdf"; filename*=UTF-8''${encodeURIComponent(result.metadata.filename).replace(/['()*]/g, c => '%' + c.charCodeAt(0).toString(16))}`);
    response.setHeader('Content-Security-Policy', "sandbox; default-src 'none'; frame-ancestors 'none'");
    return response.status(200).send(result.bytes);
  };
  return {
    async public(request, response) {
      headers(response);
      if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
      try {
        const requestedDownload = request.query?.download === '1';
        const result = await service.publicDocument(requestedDownload);
        return requestedDownload ? download(response, result) : response.status(200).json({ cv: result });
      } catch (e) { return error(response, e); }
    },
    async admin(request, response) {
      headers(response);
      const token = request.headers.cookie?.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
      try {
        if (request.method === 'GET') return request.query?.download !== undefined ? download(response, await service.privateDocument(request.query.download, token)) : response.status(200).json(await service.status(token));
        if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
        if (request.headers.origin !== origin || request.headers['sec-fetch-site'] === 'cross-site' || !/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] ?? '')) return response.status(403).json({ error: messages.forbidden });
        if (Number(request.headers['content-length']) > MAX_BODY) return response.status(413).json({ error: messages.pdf });
        let body = request.body;
        if (typeof body === 'string') { if (Buffer.byteLength(body) > MAX_BODY) return response.status(413).json({ error: messages.pdf }); try { body = JSON.parse(body); } catch { return response.status(400).json({ error: messages.forbidden }); } }
        if (!body || Array.isArray(body) || typeof body !== 'object' || Buffer.byteLength(JSON.stringify(body)) > MAX_BODY) return response.status(400).json({ error: messages.forbidden });
        if (body.action === 'setup') return response.status(200).json(await service.setup(body));
        if (body.action === 'login') {
          const result = await service.login(body);
          response.setHeader('Set-Cookie', `${COOKIE}=${result.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
          return response.status(200).json({ ok: true });
        }
        const result = await service.mutate(body.action, body, token, request.headers['x-cv-csrf']);
        if (body.action === 'logout' || body.action === 'credentials') response.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
        return response.status(200).json(result);
      } catch (e) { return error(response, e); }
    },
  };
}
export function productionHandlers() {
  return createCvHandlers(createCvService({ store: createBlobStore(), setupHash: process.env.CV_SETUP_HASH, setupExpires: process.env.CV_SETUP_EXPIRES }), 'https://nguyen-son-portfolio.vercel.app');
}
