import { expect, it } from 'vitest';
import { safeRemotePreview } from './remote-project-preview';
const name = 'JasonTM17/Future_Project';
it('accepts same-identity GitHub raster sources and rejects cross-repo or unsafe image/link URLs', () => {
  const valid = { fullName:name,verifiedAt:new Date().toISOString(),stale:false,preview:{imageUrl:`https://raw.githubusercontent.com/${name}/HEAD/docs/home.png?v=123`,sourceUrl:`https://github.com/${name}/blob/HEAD/docs/home.png`} };
  expect(safeRemotePreview(valid,name)).not.toBe(null);
  for (const imageUrl of ['javascript:alert(1)','https://evil.test/a.png',`https://raw.githubusercontent.com/other/repo/HEAD/a.png`,`https://raw.githubusercontent.com/${name}/HEAD/a.svg`]) expect(safeRemotePreview({...valid,preview:{...valid.preview,imageUrl}},name)).toBe(null);
  expect(safeRemotePreview({...valid,fullName:'other/repo'},name)).toBe(null);
  expect(safeRemotePreview({...valid,preview:{...valid.preview,sourceUrl:'https://evil.test'}},name)).toBe(null);
});
