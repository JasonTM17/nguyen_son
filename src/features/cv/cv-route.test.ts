import { expect, it } from 'vitest';
import { cvSetupToken, isCvAdminLocation } from './cv-route';
it('accepts exact canonical and old admin locations without capturing portfolio anchors', () => {
  for (const pathname of ['/admin', '/admin/', '/admin-cv', '/admin-cv/']) expect(isCvAdminLocation({ pathname, hash: '' })).toBe(true);
  expect(isCvAdminLocation({ pathname: '/', hash: '#admin-cv' })).toBe(true);
  for (const hash of ['#projects', '#archive', '#admin-cv-extra', '#admin-cv/other']) expect(isCvAdminLocation({ pathname: '/', hash })).toBe(false);
  for (const pathname of ['/api/cv-admin', '/administrator', '/admin/other']) expect(isCvAdminLocation({ pathname, hash: '' })).toBe(false);
});
it('setup capability stays in fragment and accepts only a bounded base64url value', () => {
  const token = 'a'.repeat(43);
  expect(cvSetupToken({ pathname: '/admin', hash: '#setup=' + token })).toBe(token);
  expect(cvSetupToken({ pathname: '/', hash: '#admin-cv?setup=' + token })).toBe(token);
  expect(cvSetupToken({ pathname: '/admin-cv', hash: '#setup=' + token })).toBe(token);
  expect(cvSetupToken({ pathname: '/', hash: '#setup=' + token })).toBe('');
  expect(cvSetupToken({ pathname: '/admin', hash: '#setup=too-short' })).toBe('');
  expect(cvSetupToken({ pathname: '/admin', hash: '#setup=' + 'a'.repeat(200) })).toBe('');
  expect(cvSetupToken({ pathname: '/admin', hash: '' })).toBe('');
});
