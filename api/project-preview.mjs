import { getPinnedProjects } from '../server/github-pins/service.mjs';
import { getRepositoryPreview } from '../server/github-previews/service.mjs';
import { validRepository } from '../server/github-previews/candidates.mjs';
export function createPreviewHandler({ getPins = getPinnedProjects, getPreview = getRepositoryPreview } = {}) {
  return async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.setHeader('X-Content-Type-Options', 'nosniff'); response.setHeader('Cache-Control', 'no-store');
    if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
    const repo = request.query?.repo;
    if (!validRepository(repo)) return response.status(400).json({ error: 'Invalid repository' });
    try {
      const pins = await getPins();
      if (!pins.repositories.some(item => item.fullName === repo && item.href === `https://github.com/${repo}`)) return response.status(404).json({ error: 'Repository is not pinned' });
      const result = await getPreview(repo);
      response.setHeader('Cache-Control', `public, max-age=0, s-maxage=${result.preview ? 60 : 30}`);
      return response.status(200).json(result);
    } catch { return response.status(503).json({ error: 'Project preview temporarily unavailable' }); }
  };
}
export default createPreviewHandler();
