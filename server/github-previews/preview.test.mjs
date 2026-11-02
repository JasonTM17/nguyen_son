import test from 'node:test';
import assert from 'node:assert/strict';
import { repositoryImage, readmeCandidates } from './candidates.mjs';
import { discoverRepositoryPreview, createPreviewService } from './service.mjs';
import { createPreviewHandler } from '../../api/project-preview.mjs';
const name = 'JasonTM17/Future_Project';
const image = `https://raw.githubusercontent.com/${name}/HEAD/docs/screenshots/home.png`;
const fixture = () => ({ fullName: name, verifiedAt: new Date(1000000).toISOString(), stale: false, preview: { imageUrl: image, sourceUrl: `https://github.com/${name}/blob/HEAD/docs/screenshots/home.png` } });
test('README ranking skips badges/logos and supports Markdown/HTML/reference/relative images', () => {
  const candidates = readmeCandidates('![Badge](https://img.shields.io/a.png)\n<img src="logo.png" width="100" />\n![Settings](docs/screenshots/settings.png)\n![Home](./docs/screenshots/home.png)\n![Cover][cover]\n[cover]: docs/portfolio/cover.webp\n<img alt="dashboard" src="docs/dashboard.png" />', name);
  assert.ok(candidates[0].imageUrl.endsWith('/docs/portfolio/cover.webp'));
  assert.ok(candidates.some(c => c.imageUrl === image)); assert.ok(candidates.every(c => !/logo|shields/.test(c.imageUrl)));
});
test('URLs are HTTPS same-repository raster only; traversal, credentials, external and active URLs rejected', () => {
  for (const url of ['http://127.0.0.1/a.png', 'https://example.org/a.png', '//127.0.0.1/a.png', 'javascript:alert(1)', 'data:image/png;base64,xx', '../private.png', 'docs/%2e%2e/a.png', 'docs/%2Fsecret.png', 'https://raw.githubusercontent.com/other/repo/HEAD/a.png', 'https://raw.githubusercontent.com@127.0.0.1/a.png', 'docs/logo.svg', 'https://raw.githubusercontent.com/' + name + '/HEAD/a.png?token=x']) assert.equal(repositoryImage(url, name), null, url);
  assert.equal(repositoryImage('https://github.com/' + name + '/blob/main/docs/home.png?raw=true', name).imageUrl, 'https://raw.githubusercontent.com/' + name + '/main/docs/home.png');
  assert.ok(repositoryImage('./docs/my%20home.png', name));
});
test('discovery handles uppercase README and rejects invalid MIME/oversized/redirected candidates before a valid image', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options.method, redirect: options.redirect });
    if (url.endsWith('/README.md')) return new Response('', { status: 404 });
    if (url.endsWith('/README.MD')) return new Response('![Cover](cover.png)\n![Home](docs/screenshots/home.png)');
    if (url.endsWith('/cover.png')) return new Response(null, { headers: { 'content-type': 'text/html' } });
    if (url === image) return new Response(null, { headers: { 'content-type': 'image/png', 'content-length': '100' } });
    throw new Error('Unexpected request');
  };
  const result = await discoverRepositoryPreview(name, { fetchImpl, now: () => 1000000 });
  assert.ok(result.preview.imageUrl.startsWith(image + '?v='));
  assert.equal(calls.filter(c => c.method === 'HEAD').length, 2); assert.equal(calls[0].redirect, 'error');
});
test('missing README images finds a bounded repository-tree screenshot without following returned URLs', async () => {
  const calls = [];
  const result = await discoverRepositoryPreview(name, { fetchImpl: async (url, options) => {
    calls.push(url);
    if (url.includes('/README.')) return new Response('# Project');
    if (url.includes('/git/trees/')) return Response.json({ tree: [{ type: 'blob', path: 'docs/screenshots/home.png', size: 100, url: 'http://127.0.0.1/never' }] });
    return url === image ? new Response(null, { headers: { 'content-type': 'image/png', 'content-length': '100' } }) : new Response('', { status: 404 });
  } });
  assert.ok(result.preview); assert.ok(calls.every(url => !url.startsWith('http:')));
});
test('untrusted attachment redirects never become server fetch targets', async () => {
  const attachment = 'https://github.com/user-attachments/assets/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; const calls = [];
  const result = await discoverRepositoryPreview(name, { fetchImpl: async (url, options) => {
    calls.push(url);
    if (options.method === 'GET') return new Response('![Screenshot](' + attachment + ')\n![home](docs/screenshots/home.png)');
    if (url === attachment) return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } });
    return new Response(null, { headers: { 'content-type': 'image/png', 'content-length': '9000000' } });
  } });
  assert.equal(result.preview, null); assert.ok(calls.every(url => !url.startsWith('http:')));
});
test('cache coalesces reads, preserves original stale age, expires and backs off failures', async () => {
  let time = 1000000, calls = 0, fail = false;
  const get = createPreviewService({ now: () => time, discover: async () => { calls++; if (fail) throw new Error('offline'); return fixture(); } });
  await Promise.all([get(name), get(name)]); assert.equal(calls, 1);
  time += 300001; fail = true; const stale = await get(name); assert.equal(stale.stale, true); assert.equal(stale.verifiedAt, fixture().verifiedAt);
  await get(name); assert.equal(calls, 2);
  time = 1000000 + 3599999; await get(name); const beforeExpiry = calls;
  time = 1000000 + 3601000; await assert.rejects(get(name)); assert.equal(calls, beforeExpiry);
  time += 3600001; await assert.rejects(get(name)); const count = calls; await assert.rejects(get(name)); assert.equal(calls, count);
});
test('public handler checks current pin membership before any image discovery', async () => {
  let calls = 0; const handler = createPreviewHandler({ getPins: async () => ({ repositories: [{ fullName: name, href: `https://github.com/${name}` }] }), getPreview: async () => { calls++; return fixture(); } });
  const response = () => ({ code: 0, setHeader() {}, status(n) { this.code=n;return this; }, json(v) { this.body=v;return this; } });
  let res = response(); await handler({ method: 'GET', query: { repo: 'JasonTM17/Not_Pinned' } }, res); assert.equal(res.code, 404); assert.equal(calls, 0);
  res = response(); await handler({ method: 'GET', query: { repo: 'http://127.0.0.1' } }, res); assert.equal(res.code, 400);
  res = response(); await handler({ method: 'GET', query: { repo: name } }, res); assert.equal(res.code, 200); assert.equal(calls, 1);
});
