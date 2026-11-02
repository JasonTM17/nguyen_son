import { describe, it, expect } from 'vitest';
import { projectOverviewRequest } from './project-overview.mjs';
import { retrievePortfolioContext } from './portfolio-assistant-rag.mjs';
const repository = (name, language = 'Python') => ({ name, fullName: `JasonTM17/${name}`, href: `https://github.com/JasonTM17/${name}`, description: 'A public learning application with a documented interface.', language, topics: [] });
const feed = repositories => ({ repositories, verifiedAt: '2026-11-01T00:00:00Z', stale: false });
describe('representative project overviews', () => {
  it('selects exactly three current pins in order instead of unrelated lexical matches/history', () => {
    const pins = feed(['One_Project', 'Two_Project', 'Three_Project', 'Four_Project'].map(name => repository(name)));
    const catalog = feed([repository('Unrelated_Vietnamese_Project')]);
    for (const question of ['Giới thiệu ngắn 3 dự án tiêu biểu và công nghệ chính, mỗi dự án tối đa 2 câu.', 'Introduce three representative projects', 'Show 3 featured projects']) {
      const result = retrievePortfolioContext(question, [{ role: 'user', content: 'Unrelated_Vietnamese_Project' }], { catalog, pins });
      expect(result.projectCount).toBe(3); expect(result.references.map(ref => ref.href)).toEqual(pins.repositories.slice(0, 3).map(repo => repo.href));
      expect(result.overview).toEqual({ requestedCount: 3, count: 3, basis: 'github-pins' });
      expect(result.context).not.toContain('public learning application');
    }
    const reversed = retrievePortfolioContext('Giới thiệu 2 dự án nổi bật', [], { catalog, pins: feed([...pins.repositories].reverse()) });
    expect(reversed.references.map(ref => ref.href)).toEqual([...pins.repositories].reverse().slice(0, 2).map(repo => repo.href));
  });
  it('does not steal technology, domain, named detail or comparison requests', () => {
    for (const question of ['Giới thiệu 3 dự án Java tiêu biểu', 'Show 3 Python projects', 'Show 3 C++ projects', 'Show 3 C# projects', 'Show 3 representative projects using C++.', 'Show 3 projects using C#?', 'Show 3 projects written in C', 'Giới thiệu 3 dự án thương mại điện tử', 'Show 3 Tailwind projects', 'Giới thiệu dự án y tế', 'Compare featured projects', 'Show other representative projects', 'Which projects are featured?', 'Show pinned projects']) expect(projectOverviewRequest(question)).toBe(null);
    const result = retrievePortfolioContext('Giới thiệu dự án Three_Project', [], { catalog: feed([]), pins: feed(['One_Project', 'Three_Project'].map(name => repository(name))) });
    expect(result.projectCount).toBe(1); expect(result.references[0].href).toBe('https://github.com/JasonTM17/Three_Project'); expect(result.overview).toBe(null);
  });
  it('bounds counts and uses only current catalog fallback, never resurrected static facts', () => {
    const catalog = feed(Array.from({ length: 8 }, (_, index) => repository('Project_' + index)));
    const result = retrievePortfolioContext('Giới thiệu 99 dự án tiêu biểu', [], { catalog, pins: null });
    expect(result.projectCount).toBe(6); expect(result.overview.basis).toBe('public-catalog');
    const empty = retrievePortfolioContext('Giới thiệu 3 dự án tiêu biểu', [], { catalog: null, pins: null });
    expect(empty.projectCount).toBe(0); expect(empty.references).toEqual([]);
  });
});
