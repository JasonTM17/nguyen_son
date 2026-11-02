export const MAX_DOCUMENTS = 20;
export const validId = (value) => typeof value === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(value);
export const validFilename = (value) => typeof value === 'string' && value.length > 4 && value.length <= 120 && /\.pdf$/i.test(value) && !/[\x00-\x1f\x7f/\\]/.test(value);
const pathId = (path) => typeof path === 'string' ? path.match(/^portfolio-cv\/files\/([a-f0-9-]{36})\.pdf$/)?.[1] : undefined;
const unavailable = () => { throw Object.assign(new Error('unavailable'), { code: 'unavailable', status: 503 }); };
export function hydrateLibrary(value) {
  // Legacy owner records are read without writing: real current and previous files survive release.
  const source = value.documents ?? [value.current, value.previous].filter(Boolean).filter((doc, index, list) => list.findIndex(other => other.path === doc.path) === index).map(doc => ({ ...doc, id: pathId(doc.path) }));
  if (!Array.isArray(source) || source.length > MAX_DOCUMENTS) unavailable();
  const ids = new Set(), paths = new Set();
  for (const doc of source) {
    if (!doc || !validId(doc.id) || !validId(pathId(doc.path)) || !validFilename(doc.filename) || !Number.isInteger(doc.size) || doc.size < 1 || doc.size > 3 * 1024 * 1024 || !Number.isFinite(Date.parse(doc.updatedAt)) || ids.has(doc.id) || paths.has(doc.path)) unavailable();
    ids.add(doc.id); paths.add(doc.path);
  }
  if (value.current && !source.some(doc => doc.path === value.current.path && doc.filename === value.current.filename && doc.size === value.current.size && doc.updatedAt === value.current.updatedAt)) unavailable();
  value.documents = source;
  return value;
}
export const documentMetadata = (doc) => ({ filename: doc.filename, size: doc.size, updatedAt: doc.updatedAt });
