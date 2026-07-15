import type { PortfolioLanguage } from "../i18n/portfolio-language-context";
import type { PortfolioProject } from "../types/portfolio";
import type { PublicGithubRepository } from "../types/public-github-repository";

const LIVE_PROJECT_COPY = {
  en: {
    category: "Public GitHub project",
    description: (name: string) => `${name} is a newly published learning project. Open the repository for its latest notes and source code.`,
  },
  vi: {
    category: "Dự án GitHub công khai",
    description: (name: string) => `${name} là dự án học tập mới được công khai. Hãy mở repository để xem ghi chú và mã nguồn mới nhất.`,
  },
} as const;

function repositoryTitle(name: string): string {
  return name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function liveRepositoryToProject(
  repository: PublicGithubRepository,
  language: PortfolioLanguage,
): PortfolioProject {
  const copy = LIVE_PROJECT_COPY[language];
  const title = repositoryTitle(repository.name);
  const tags = repository.topics.length
    ? repository.topics.slice(0, 4)
    : [repository.language ?? "GitHub"];

  return {
    category: copy.category,
    description: repository.description ?? copy.description(title),
    href: repository.href,
    tags,
    title,
  };
}

export function mergePublicProjectArchive(
  curatedProjects: readonly PortfolioProject[],
  liveRepositories: readonly PublicGithubRepository[],
  language: PortfolioLanguage,
  hasAuthoritativeSnapshot = false,
): readonly PortfolioProject[] {
  const curatedByUrl = new Map(curatedProjects.map((project) => [project.href, project]));
  const liveProjects = liveRepositories.map(
    (repository) => curatedByUrl.get(repository.href) ?? liveRepositoryToProject(repository, language),
  );

  if (hasAuthoritativeSnapshot) return liveProjects;

  const liveUrls = new Set(liveRepositories.map((repository) => repository.href));
  return [...liveProjects, ...curatedProjects.filter((project) => !liveUrls.has(project.href))];
}
