import { randomBytes, randomUUID, createHash, createHmac, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { MAX_DOCUMENTS, validId, validFilename, hydrateLibrary, documentMetadata } from './library.mjs';
const scrypt = promisify(scryptCallback);
export const MAX_PDF_BYTES = 3 * 1024 * 1024;
const STATE = 'portfolio-cv/owner.json';
const WINDOW = 15 * 60 * 1000;
const SESSION = 8 * 60 * 60 * 1000;
const digest = (s) => createHash('sha256').update(s).digest('hex');
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && Buffer.byteLength(a) === Buffer.byteLength(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const fail = (code, status = 400) => { throw Object.assign(new Error(code), { code, status }); };
const csrfFor = (token) => createHmac('sha256', token).update('portfolio-cv-csrf').digest('base64url');
function credentials(username, password) {
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_.-]{3,40}$/.test(username) || typeof password !== 'string' || password.length < 15 || password.length > 128) fail('credentials');
}
async function passwordRecord(password) {
  const salt = randomBytes(32).toString('hex');
  const hash = (await scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 })).toString('hex');
  return { salt, hash };
}
async function passwordMatches(password, record) {
  const actual = (await scrypt(password, record.salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 })).toString('hex');
  return equal(actual, record.hash);
}
function pdf(body) {
  if (!validFilename(body.filename)) fail('pdf');
  if (typeof body.data !== 'string' || body.data.length > Math.ceil(MAX_PDF_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(body.data)) fail('pdf');
  const bytes = Buffer.from(body.data, 'base64');
  if (!bytes.length || bytes.length > MAX_PDF_BYTES || bytes.toString('base64') !== body.data || !/^%PDF-1\.[0-9]|^%PDF-2\.0/.test(bytes.subarray(0, 8).toString('ascii')) || !bytes.subarray(-1024).includes(Buffer.from('%%EOF'))) fail('pdf');
  return bytes;
}
export function createCvService({ store, setupHash, setupExpires, now = Date.now }) {
  async function read() {
    const record = await store.read(STATE);
    if (!record) return null;
    const value = JSON.parse(record.bytes.toString());
    if (value.schema !== 1 || typeof value.username !== 'string' || !/^[a-f0-9]{128}$/.test(value.password?.hash ?? '') || !/^[a-f0-9]{64}$/.test(value.password?.salt ?? '')) fail('unavailable', 503);
    return { value: hydrateLibrary(value), etag: record.etag };
  }
  const publicCv = (value) => value?.current ? { filename: value.current.filename, size: value.current.size, updatedAt: value.current.updatedAt } : null;
  const write = (value, etag) => store.write(STATE, JSON.stringify(value), etag);
  function authorize(record, token, csrf) {
    if (!record || typeof token !== 'string' || !/^[\w-]{43}$/.test(token) || !equal(digest(token), record.value.session?.hash) || record.value.session.expires <= now()) fail('unauthorized', 401);
    if (csrf !== undefined && !equal(csrf, csrfFor(token))) fail('forbidden', 403);
  }
  async function status(token) {
    const record = await read();
    let authenticated = false;
    try { authorize(record, token); authenticated = true; } catch { /* An absent/expired session is a signed-out status. */ }
    return { initialized: Boolean(record), authenticated, cv: publicCv(record?.value),
      ...(authenticated ? { username: record.value.username, revision: record.etag, csrf: csrfFor(token), documents: record.value.documents.map(doc => ({ ...documentMetadata(doc), id: doc.id, published: record.value.current?.path === doc.path })) } : {}) };
  }
  async function reserveAttempt(record) {
    let current = record;
    for (let retry = 0; retry < 2; retry++) {
      const value = structuredClone(current.value);
      if (!value.attempts || now() - value.attempts.start >= WINDOW) value.attempts = { start: now(), count: 0 };
      if (value.attempts.count >= 5) fail('limited', 429);
      value.attempts.count++;
      try {
        const saved = await write(value, current.etag);
        return { value, etag: saved.etag };
      } catch (err) {
        if (err.code === 'conflict' && retry === 0) {
          const fresh = await read();
          if (fresh) { current = fresh; continue; }
        }
        throw err;
      }
    }
  }
  return {
    status,
    async privateDocument(id, token) {
      const record = await read();
      authorize(record, token);
      if (!validId(id)) fail('document_not_found', 404);
      const doc = record.value.documents.find(item => item.id === id);
      if (!doc) fail('document_not_found', 404);
      const file = await store.read(doc.path);
      if (!file) fail('unavailable', 503);
      return { bytes: file.bytes, metadata: documentMetadata(doc) };
    },
    async publicDocument(download = false) {
      const record = await read();
      if (!download) return publicCv(record?.value);
      const current = record?.value.current;
      if (!current) fail('not_found', 404);
      if (!/^portfolio-cv\/files\/[a-f0-9-]{36}\.pdf$/.test(current.path)) fail('unavailable', 503);
      const file = await store.read(current.path);
      if (!file) fail('unavailable', 503);
      return { bytes: file.bytes, metadata: publicCv(record.value) };
    },
    async setup(body) {
      if (!/^[a-f0-9]{64}$/.test(setupHash ?? '') || !Number.isFinite(Number(setupExpires)) || now() >= Number(setupExpires) || typeof body.setupToken !== 'string' || body.setupToken.length !== 43 || !equal(digest(body.setupToken), setupHash)) fail('forbidden', 403);
      if (await read()) fail('initialized', 409);
      credentials(body.username, body.password);
      await write({ schema: 1, username: body.username, password: await passwordRecord(body.password), session: null, current: null, previous: null, attempts: null });
      return { ok: true };
    },
    async login(body) {
      if (typeof body.username !== 'string' || body.username.length > 40 || typeof body.password !== 'string' || body.password.length > 128) fail('unauthorized', 401);
      let record = await read();
      if (!record) fail('unauthorized', 401);
      record = await reserveAttempt(record); // Durable reservation before expensive password verification.
      const validPassword = await passwordMatches(body.password, record.value.password);
      if (!equal(body.username, record.value.username) || !validPassword) fail('unauthorized', 401);
      const token = randomBytes(32).toString('base64url');
      const value = { ...record.value, attempts: null, session: { hash: digest(token), expires: now() + SESSION } };
      try {
        await write(value, record.etag);
      } catch (err) {
        if (err.code === 'conflict') {
          const fresh = await read();
          if (fresh && equal(body.username, fresh.value.username)) {
            const freshVal = { ...fresh.value, attempts: null, session: { hash: digest(token), expires: now() + SESSION } };
            await write(freshVal, fresh.etag);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      return { token };
    },
    async mutate(action, body, token, csrf) {
      const record = await read();
      authorize(record, token, csrf ?? '');
      const normalize = (rev) => typeof rev === 'string' ? rev.replace(/^W\//i, '').trim() : rev;
      if (normalize(body.revision) !== normalize(record.etag)) fail('conflict', 409);
      const value = structuredClone(record.value);
      if (action === 'logout') {
        value.session = null;
        await write(value, record.etag);
      } else if (action === 'credentials') {
        credentials(body.username, body.password);
        const reserved = await reserveAttempt(record);
        if (typeof body.currentPassword !== 'string' || body.currentPassword.length > 128 || !(await passwordMatches(body.currentPassword, value.password))) fail('unauthorized', 401);
        value.username = body.username;
        value.password = await passwordRecord(body.password);
        value.session = null;
        value.attempts = null;
        await write(value, reserved.etag);
      } else if (['upload', 'add', 'replace'].includes(action)) {
        // Legacy cached clients may still submit upload: replace only the published entry.
        const old = action === 'replace' ? value.documents.find(doc => doc.id === body.id) : action === 'upload' ? value.documents.find(doc => doc.path === value.current?.path) : undefined;
        if (action === 'replace' && !old) fail('document_not_found', 404);
        if (!old && value.documents.length >= MAX_DOCUMENTS) fail('library_full', 409);
        const bytes = pdf(body);
        const path = `portfolio-cv/files/${randomUUID()}.pdf`;
        await store.write(path, bytes);
        const doc = { id: old?.id ?? randomUUID(), path, filename: body.filename, size: bytes.length, updatedAt: new Date(now()).toISOString() };
        value.documents = old ? value.documents.map(item => item.id === old.id ? doc : item) : [...value.documents, doc];
        if (action === 'upload' || old && value.current?.path === old.path) value.current = doc;
        value.previous = null;
        try { await write(value, record.etag); }
        catch (error) { await store.remove(path).catch(() => {}); throw error; }
        if (old) await store.remove(old.path).catch(() => {});
      } else if (['rename', 'publish', 'delete'].includes(action)) {
        const doc = value.documents.find(item => item.id === body.id);
        if (!doc) fail('document_not_found', 404);
        if (action === 'rename') {
          if (!validFilename(body.filename)) fail('filename');
          doc.filename = body.filename;
          if (value.current?.path === doc.path) value.current = doc;
        } else if (action === 'publish') value.current = doc;
        else {
          if (value.current?.path === doc.path) fail('published_document', 409);
          value.documents = value.documents.filter(item => item.id !== doc.id);
        }
        value.previous = null;
        await write(value, record.etag);
        if (action === 'delete') await store.remove(doc.path).catch(() => {});
      } else if (action === 'remove') {
        value.current = null;
        value.previous = null;
        await write(value, record.etag);
      } else fail('action');
      return { ok: true };
    },
  };
}
