import { expect, it } from 'vitest';
import { reviewedProjectSummary, reviewedProjectStack } from './project-summaries';
import { projectTechnologies } from './project-technologies';
it('localizes source-backed summaries and never lends them to a foreign owner', () => {
  expect(reviewedProjectSummary('JasonTM17/Uptime-Monitoring-Platform', 'vi')).toContain('giám sát website');
  expect(reviewedProjectSummary('JasonTM17/All-In-One-Holiday', 'en')).toContain('holiday');
  expect(reviewedProjectSummary('other/All-In-One-Holiday', 'vi')).toBeUndefined();
  expect(reviewedProjectSummary('JasonTM17/New_Unknown_Repo', 'vi')).toBeUndefined();
  expect(reviewedProjectStack('other/CampusCore_Ecosystem')).toEqual([]);
});
it('technology pills drop descriptive topics and normalize metadata aliases', () => {
  expect(projectTechnologies(['TypeScript', 'birthday-card', 'nextjs', 'tailwindcss', 'typescript', 'admin-dashboard', 'alerting', 'docker'])).toEqual(['TypeScript', 'Next.js', 'Tailwind CSS', 'Docker']);
});
