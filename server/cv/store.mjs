import { get, put, del, head, BlobNotFoundError, BlobPreconditionFailedError } from '@vercel/blob';

export function normalizeEtag(etag) {
  if (!etag || typeof etag !== 'string') return undefined;
  const clean = etag.replace(/^W\//i, '').trim();
  return clean || undefined;
}

export function createBlobStore(token = process.env.BLOB_READ_WRITE_TOKEN) {
  const options = () => ({ token, access: 'private', abortSignal: AbortSignal.timeout(15000) });
  return {
    async read(path) {
      const result = await get(path, { ...options(), useCache: false });
      if (!result) return null;
      let etag = normalizeEtag(result.blob.etag);
      if (!etag || result.blob.etag?.startsWith('W/')) {
        try {
          const meta = await head(path, options());
          if (meta?.etag) etag = normalizeEtag(meta.etag);
        } catch { /* fallback to etag from get */ }
      }
      return { bytes: Buffer.from(await new Response(result.stream).arrayBuffer()), etag };
    },
    async write(path, bytes, etag) {
      const cleanEtag = normalizeEtag(etag);
      try {
        return await put(path, bytes, { ...options(), addRandomSuffix: false,
          allowOverwrite: Boolean(etag || cleanEtag), ...(cleanEtag ? { ifMatch: cleanEtag } : {}),
          contentType: path.endsWith('.pdf') ? 'application/pdf' : 'application/json', cacheControlMaxAge: 60 });
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError || error?.message?.includes('already exists')) {
          throw Object.assign(new Error('conflict'), { status: 409, code: 'conflict' });
        }
        throw error;
      }
    },
    async remove(path) { try { await del(path, { token, abortSignal: AbortSignal.timeout(15000) }); } catch (e) { if (!(e instanceof BlobNotFoundError)) throw e; } },
  };
}
