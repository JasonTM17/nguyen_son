import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createCvService } from './service.mjs';
import { createCvHandlers, COOKIE } from './handlers.mjs';

class MemoryStore {
  files = new Map(); seq = 0; beforeWrite;
  async read(path) { const row = this.files.get(path); return row ? { bytes: Buffer.from(row.bytes), etag: row.etag } : null; }
  async write(path, bytes, etag) {
    await this.beforeWrite?.(path, bytes);
    const old = this.files.get(path);
    if (etag ? old?.etag !== etag : old) throw Object.assign(new Error('conflict'), { code: 'conflict', status: 409 });
    const row = { bytes: Buffer.from(bytes), etag: String(++this.seq) }; this.files.set(path, row); return { etag: row.etag };
  }
  async remove(path) { this.files.delete(path); }
}
const token = 'a'.repeat(43), password = 'a very strong CV password';
const sample = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n').toString('base64');
async function fixture() {
  const store = new MemoryStore(); let time = 1800000000000;
  const service = createCvService({ store, setupHash: createHash('sha256').update(token).digest('hex'), setupExpires: time + 10000, now: () => time });
  await service.setup({ setupToken: token, username: 'owner', password });
  const session = (await service.login({ username: 'owner', password })).token;
  return { store, service, session, advance: n => { time += n; } };
}
async function mutation(f, action, extra = {}) { const s = await f.service.status(f.session); return f.service.mutate(action, { revision: s.revision, ...extra }, f.session, s.csrf); }
test('one-time setup is create-only under simultaneous calls; no secret in status', async () => {
  const store = new MemoryStore(); const service = createCvService({ store, setupHash: createHash('sha256').update(token).digest('hex'), setupExpires: Date.now() + 10000 });
  const results = await Promise.allSettled([1, 2].map(() => service.setup({ setupToken: token, username: 'owner', password })));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.deepEqual(await service.status(), { initialized: true, authenticated: false, cv: null });
  await assert.rejects(service.setup({ setupToken: 'x'.repeat(43), username: 'x', password }), { status: 403 });
});
test('expired setup and weak password fail closed', async () => {
  const service = createCvService({ store: new MemoryStore(), setupHash: createHash('sha256').update(token).digest('hex'), setupExpires: 1 });
  await assert.rejects(service.setup({ setupToken: token, username: 'owner', password }), { status: 403 });
  const s = createCvService({ store: new MemoryStore(), setupHash: createHash('sha256').update(token).digest('hex'), setupExpires: Date.now() + 10000 });
  await assert.rejects(s.setup({ setupToken: token, username: 'owner', password: 'weak' }), { code: 'credentials' });
});
test('upload, replacement, public read, remove and credential rotation', async () => {
  const f = await fixture();
  await mutation(f, 'upload', { filename: 'CV Nguyễn Sơn.pdf', data: sample });
  assert.equal((await f.service.publicDocument()).filename, 'CV Nguyễn Sơn.pdf');
  assert.equal((await f.service.publicDocument(true)).bytes.toString('base64'), sample);
  await mutation(f, 'upload', { filename: 'CV2.pdf', data: sample });
  assert.equal((await f.service.publicDocument()).filename, 'CV2.pdf');
  await mutation(f, 'remove'); assert.equal(await f.service.publicDocument(), null);
  await assert.rejects(f.service.publicDocument(true), { status: 404 });
  await mutation(f, 'credentials', { username: 'new-owner', password: password + ' new', currentPassword: password });
  assert.equal((await f.service.status(f.session)).authenticated, false);
  await assert.rejects(f.service.login({ username: 'owner', password }), { status: 401 });
  assert.ok((await f.service.login({ username: 'new-owner', password: password + ' new' })).token);
});
test('missing session, csrf, stale revision and invalid PDF cannot publish', async () => {
  const f = await fixture(); const s = await f.service.status(f.session);
  await assert.rejects(f.service.mutate('upload', {}, '', ''), { status: 401 });
  await assert.rejects(f.service.mutate('upload', { revision: s.revision }, f.session, 'wrong'), { status: 403 });
  await assert.rejects(f.service.mutate('upload', { revision: 'old' }, f.session, s.csrf), { status: 409 });
  // Verify weak ETag from CDN (W/ prefix) is normalized and succeeds
  await f.service.mutate('upload', { revision: `W/${s.revision}`, filename: 'CV Nguyễn Sơn.pdf', data: sample }, f.session, s.csrf);
  assert.equal((await f.service.publicDocument()).filename, 'CV Nguyễn Sơn.pdf');
  await f.service.mutate('remove', { revision: (await f.service.status(f.session)).revision }, f.session, s.csrf);
  for (const bad of [{ filename: 'cv.html', data: sample }, { filename: '../cv.pdf', data: sample }, { filename: 'cv.pdf', data: Buffer.from('<script>hi</script>').toString('base64') }, { filename: 'cv.pdf', data: 'A'.repeat(4194308) }]) await assert.rejects(mutation(f, 'upload', bad), { code: 'pdf' });
  assert.equal(await f.service.publicDocument(), null);
});
test('logout invalidates cookie; new login replaces old cookie; sessions expire', async () => {
  const f = await fixture(); const old = f.session;
  f.session = (await f.service.login({ username: 'owner', password })).token;
  assert.equal((await f.service.status(old)).authenticated, false);
  await mutation(f, 'logout'); assert.equal((await f.service.status(f.session)).authenticated, false);
  f.session = (await f.service.login({ username: 'owner', password })).token;
  f.advance(8 * 3600000); assert.equal((await f.service.status(f.session)).authenticated, false);
});
test('durable fixed-window reservation survives parallel logins and cannot extend lock', async () => {
  const f = await fixture();
  await Promise.allSettled(Array.from({ length: 8 }, () => f.service.login({ username: 'owner', password: 'wrong' })));
  for (let i = 0; i < 5; i++) await f.service.login({ username: 'owner', password: 'wrong' }).catch(() => {});
  await assert.rejects(f.service.login({ username: 'owner', password }), { status: 429 });
  f.advance(15 * 60000); assert.ok((await f.service.login({ username: 'owner', password })).token);
});
for (const invalidation of ['logout', 'credentials']) test(`paused upload cannot publish after ${invalidation}`, async () => {
  const f = await fixture(); await mutation(f, 'upload', { filename: 'old.pdf', data: sample });
  let reached, resume; const boundary = new Promise(r => { reached = r; }); const paused = new Promise(r => { resume = r; });
  f.store.beforeWrite = async (path) => { if (path.endsWith('.pdf')) { reached(); await paused; } };
  const upload = mutation(f, 'upload', { filename: 'new.pdf', data: sample });
  await boundary;
  await mutation(f, invalidation, invalidation === 'credentials' ? { username: 'owner', password: password + ' new', currentPassword: password } : {});
  resume(); await assert.rejects(upload, { status: 409 });
  assert.equal((await f.service.publicDocument()).filename, 'old.pdf');
  assert.equal([...f.store.files.keys()].filter(p => p.endsWith('.pdf')).length, 1);
});
test('pointer failure preserves old CV and removes only new orphan', async () => {
  const f = await fixture(); await mutation(f, 'upload', { filename: 'old.pdf', data: sample });
  f.store.beforeWrite = async path => { if (path.endsWith('owner.json')) throw new Error('storage unavailable'); };
  await assert.rejects(mutation(f, 'upload', { filename: 'new.pdf', data: sample }));
  assert.equal((await f.service.publicDocument()).filename, 'old.pdf');
  assert.equal([...f.store.files.keys()].filter(p => p.endsWith('.pdf')).length, 1);
});
function response() { return { code: 0, headers: {}, body: null, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.code = n; return this; }, json(b) { this.body = b; return this; }, send(b) { this.body = b; return this; } }; }
test('HTTP contract: origin, media type, body limit, cookie flags, attachment and no-store', async () => {
  const f = await fixture(); const handlers = createCvHandlers(f.service, 'https://portfolio.test');
  const req = { method: 'POST', headers: { origin: 'https://evil.test', 'content-type': 'application/json' }, body: { action: 'login', username: 'owner', password } };
  let res = response(); await handlers.admin(req, res); assert.equal(res.code, 403);
  req.headers.origin = 'https://portfolio.test'; req.headers['content-type'] = 'text/plain'; res = response(); await handlers.admin(req, res); assert.equal(res.code, 403);
  req.headers['content-type'] = 'application/json'; req.headers['content-length'] = '5000000'; res = response(); await handlers.admin(req, res); assert.equal(res.code, 413); delete req.headers['content-length'];
  res = response(); await handlers.admin(req, res); assert.equal(res.code, 200); assert.match(res.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Strict/); assert.ok(res.headers['Set-Cookie'].startsWith(COOKIE + '='));
  f.session = res.headers['Set-Cookie'].split(';')[0].slice(COOKIE.length + 1);
  await mutation(f, 'upload', { filename: 'cv.pdf', data: sample });
  res = response(); await handlers.public({ method: 'GET', query: { download: '1' } }, res);
  assert.equal(res.code, 200); assert.match(res.headers['Content-Disposition'], /^attachment/); assert.equal(res.headers['X-Content-Type-Options'], 'nosniff'); assert.equal(res.headers['Cache-Control'], 'no-store'); assert.match(res.headers['Content-Security-Policy'], /sandbox/);
});
