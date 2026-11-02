import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { createCvService } from './service.mjs';
import { hydrateLibrary } from './library.mjs';
import { createCvHandlers } from './handlers.mjs';
const STATE = 'portfolio-cv/owner.json';
class Store {
  files = new Map(); seq = 0; beforeWrite;
  async read(path) { const item = this.files.get(path); return item ? { bytes: Buffer.from(item.bytes), etag: item.etag } : null; }
  async write(path, bytes, etag) { await this.beforeWrite?.(path, bytes); const old = this.files.get(path); if (etag ? old?.etag !== etag : old) throw Object.assign(new Error('conflict'), { status: 409, code: 'conflict' }); const item = { bytes: Buffer.from(bytes), etag: String(++this.seq) }; this.files.set(path, item); return { etag: item.etag }; }
  async remove(path) { this.files.delete(path); }
}
const password = 'local test owner passphrase';
const pdf = (text = 'original') => Buffer.from('%PDF-1.7\n' + text + '\n%%EOF\n').toString('base64');
async function fixture() {
  const store = new Store(), token = 'a'.repeat(43);
  const service = createCvService({ store, setupHash: createHash('sha256').update(token).digest('hex'), setupExpires: Date.now() + 100000 });
  await service.setup({ setupToken: token, username: 'owner', password });
  const session = (await service.login({ username: 'owner', password })).token;
  const f = { store, service, session };
  f.act = async (action, extra = {}) => { const status = await service.status(f.session); return service.mutate(action, { ...extra, revision: status.revision }, f.session, status.csrf); };
  return f;
}
const docs = f => f.service.status(f.session).then(s => s.documents);
test('legacy hydration preserves owner, session, current/previous and performs no write', async () => {
  const f = await fixture(); const state = await f.store.read(STATE); const value = JSON.parse(state.bytes);
  const currentId = randomUUID(), previousId = randomUUID();
  value.current = { path: `portfolio-cv/files/${currentId}.pdf`, filename: 'current.pdf', size: 20, updatedAt: new Date().toISOString() };
  value.previous = { ...value.current, path: `portfolio-cv/files/${previousId}.pdf`, filename: 'previous.pdf' }; delete value.documents;
  await f.store.write(STATE, JSON.stringify(value), state.etag); const before = f.store.seq;
  const result = await f.service.status(f.session);
  assert.equal(result.authenticated, true); assert.equal(result.username, 'owner'); assert.equal(result.documents.length, 2); assert.equal(result.documents[0].id, currentId); assert.equal(result.documents[0].published, true); assert.equal(result.documents[1].published, false); assert.equal(f.store.seq, before);
  assert.equal(hydrateLibrary({ ...value, previous: value.current }).documents.length, 1);
});
test('add privately, publish explicit one, rename and replace keep identity and private/public boundaries', async () => {
  const f = await fixture(); await f.act('add', { filename: 'A.pdf', data: pdf() }); await f.act('add', { filename: 'B.pdf', data: pdf('B') });
  let list = await docs(f); assert.equal(list.length, 2); assert.equal(await f.service.publicDocument(), null);
  assert.equal('documents' in await f.service.status(), false);
  await assert.rejects(f.service.privateDocument(list[0].id, ''), { status: 401 });
  await assert.rejects(f.service.privateDocument('../owner.json', f.session), { status: 404 });
  assert.equal((await f.service.privateDocument(list[1].id, f.session)).bytes.toString('base64'), pdf('B'));
  await f.act('publish', { id: list[0].id }); await f.act('rename', { id: list[0].id, filename: 'New A.pdf' });
  assert.equal((await f.service.publicDocument()).filename, 'New A.pdf');
  await f.act('replace', { id: list[0].id, filename: 'Updated A.pdf', data: pdf('new A') });
  assert.equal((await f.service.publicDocument(true)).bytes.toString('base64'), pdf('new A'));
  assert.equal((await docs(f))[0].id, list[0].id); assert.equal((await docs(f)).length, 2);
  await assert.rejects(f.act('delete', { id: list[0].id }), { code: 'published_document' });
  await f.act('publish', { id: list[1].id }); list = await docs(f); assert.equal(list.filter(d => d.published).length, 1);
  await f.act('delete', { id: list[0].id }); assert.equal((await docs(f)).length, 1);
  await f.act('remove'); assert.equal(await f.service.publicDocument(), null); assert.equal((await docs(f)).length, 1);
});
test('legacy upload never deletes unrelated library documents', async () => {
  const f = await fixture(); await f.act('upload', { filename: 'public.pdf', data: pdf() }); await f.act('add', { filename: 'private.pdf', data: pdf('private') });
  const privateDoc = (await docs(f)).find(d => !d.published);
  await f.act('upload', { filename: 'public2.pdf', data: pdf('new') });
  assert.equal((await docs(f)).length, 2); assert.equal((await f.service.privateDocument(privateDoc.id, f.session)).bytes.toString('base64'), pdf('private'));
});
test('unknown id, unsafe name, bad PDF and full library fail without changing publication', async () => {
  const f = await fixture(); await f.act('upload', { filename: 'public.pdf', data: pdf() }); const current = (await docs(f))[0];
  for (const action of ['publish', 'replace', 'delete', 'rename']) await assert.rejects(f.act(action, { id: randomUUID(), filename: 'safe.pdf', data: pdf() }), { status: 404 });
  await assert.rejects(f.act('rename', { id: current.id, filename: '../bad.pdf' }), { code: 'filename' });
  await assert.rejects(f.act('replace', { id: current.id, filename: 'safe.pdf', data: 'bad' }), { code: 'pdf' });
  const record = await f.store.read(STATE); const state = JSON.parse(record.bytes);
  for (let i = 1; i < 20; i++) { const id = randomUUID(); state.documents.push({ ...state.documents[0], id, path: `portfolio-cv/files/${id}.pdf` }); }
  await f.store.write(STATE, JSON.stringify(state), record.etag);
  await assert.rejects(f.act('add', { filename: 'overflow.pdf', data: pdf() }), { code: 'library_full' });
  assert.equal((await f.service.publicDocument()).filename, 'public.pdf');
});
for (const action of ['logout', 'credentials']) test(`replacement paused at actual file write cannot publish after ${action}`, async () => {
  const f = await fixture(); await f.act('upload', { filename: 'old.pdf', data: pdf() }); const id = (await docs(f))[0].id;
  let reached, resume; const boundary = new Promise(r => { reached = r; }), gate = new Promise(r => { resume = r; });
  f.store.beforeWrite = async path => { if (path.endsWith('.pdf')) { reached(); await gate; } };
  const replace = f.act('replace', { id, filename: 'new.pdf', data: pdf('new') }); await boundary;
  await f.act(action, action === 'credentials' ? { username: 'owner', password: password + ' new', currentPassword: password } : {});
  resume(); await assert.rejects(replace, { status: 409 }); assert.equal((await f.service.publicDocument()).filename, 'old.pdf'); assert.equal([...f.store.files.keys()].filter(k => k.endsWith('.pdf')).length, 1);
});
test('competing replacements keep winner and unrelated private file, remove only losers/displaced', async () => {
  const f = await fixture(); await f.act('upload', { filename: 'old.pdf', data: pdf() }); await f.act('add', { filename: 'private.pdf', data: pdf('private') });
  const list = await docs(f); const id = list.find(d => d.published).id, other = list.find(d => !d.published).id;
  let count = 0, reached, resume; const boundary = new Promise(r => { reached = r; }), gate = new Promise(r => { resume = r; });
  f.store.beforeWrite = async path => { if (path.endsWith('.pdf')) { if (++count === 2) reached(); await gate; } };
  const jobs = ['one', 'two'].map(name => f.act('replace', { id, filename: name + '.pdf', data: pdf(name) })); await boundary; resume();
  const results = await Promise.allSettled(jobs); assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await docs(f)).length, 2); assert.equal([...f.store.files.keys()].filter(k => k.endsWith('.pdf')).length, 2); assert.equal((await f.service.privateDocument(other, f.session)).bytes.toString('base64'), pdf('private'));
  assert.ok(['one.pdf', 'two.pdf'].includes((await f.service.publicDocument()).filename));
});
test('failed metadata/delete commit leaves names and files intact', async () => {
  const f = await fixture(); await f.act('add', { filename: 'private.pdf', data: pdf() }); const id = (await docs(f))[0].id;
  f.store.beforeWrite = async path => { if (path === STATE) throw new Error('offline'); };
  await assert.rejects(f.act('rename', { id, filename: 'new.pdf' })); await assert.rejects(f.act('delete', { id }));
  assert.equal((await docs(f))[0].filename, 'private.pdf'); assert.ok((await f.service.privateDocument(id, f.session)).bytes.length);
});
test('private download handler rejects anonymous and does not expose library metadata', async () => {
  const f = await fixture(); await f.act('add', { filename: 'private.pdf', data: pdf() }); const id = (await docs(f))[0].id;
  const handlers = createCvHandlers(f.service, 'https://portfolio.test');
  const response = () => ({ code: 0, headers: {}, setHeader(k,v) {this.headers[k]=v;}, status(n) {this.code=n;return this;}, json(b){this.body=b;return this;}, send(b){this.body=b;return this;} });
  let res = response(); await handlers.admin({ method: 'GET', headers: {}, query: { download: id } }, res); assert.equal(res.code, 401);
  res = response(); await handlers.admin({ method: 'GET', headers: {} }, res); assert.equal('documents' in res.body, false);
  res = response(); await handlers.admin({ method: 'GET', headers: { cookie: '__Host-portfolio-cv=' + f.session }, query: { download: id } }, res); assert.equal(res.code, 200); assert.match(res.headers['Content-Disposition'], /^attachment/); assert.equal(res.headers['Cache-Control'], 'no-store');
});
test('corrupt, duplicate and inconsistent library records fail closed', () => {
  const id = randomUUID(); const doc = { id, path: `portfolio-cv/files/${id}.pdf`, filename: 'valid.pdf', size: 10, updatedAt: new Date().toISOString() };
  for (const value of [
    { documents: [doc, doc], current: doc },
    { documents: [doc], current: { ...doc, filename: 'different.pdf' } },
    { documents: [{ ...doc, path: 'portfolio-cv/owner.json' }], current: null },
    { documents: [{ ...doc, id: '../owner' }], current: null },
  ]) assert.throws(() => hydrateLibrary(value), { status: 503 });
});
