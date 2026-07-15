import { getPublicProjectArchive } from "../content/public-project-archive";
import { usePublicGithubRepositories } from "../hooks/use-public-github-repositories";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";
import type { PublicGithubRepository } from "../types/public-github-repository";

function formatUpdatedAt(updatedAt: string | null, language: "en" | "vi"): string | null {
  if (!updatedAt) return null;
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { month: "short", year: "numeric" }).format(date);
}

function getLiveRepository(
  repositories: readonly PublicGithubRepository[],
  href: string,
): PublicGithubRepository | undefined {
  return repositories.find((repository) => repository.href === href);
}

export function PublicProjectArchiveSection() {
  const { error, isLoading, repositories, syncedAt } = usePublicGithubRepositories();
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].archive;
  const publicProjectArchive = getPublicProjectArchive(language);
  const syncedLabel = formatUpdatedAt(syncedAt, language);

  return (
    <section className="section section--archive" id="archive" aria-labelledby="archive-heading">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="archive-heading">{copy.heading}</h2>
      </div>
      <p className="archive-intro">
        {copy.intro}
      </p>
      <p className="archive-sync" aria-live="polite">
        {isLoading && copy.syncLoading}
        {!isLoading && !error && syncedLabel && copy.syncSuccess(syncedLabel)}
        {!isLoading && error && copy.syncFallback}
      </p>
      <ol className="project-archive">
        {publicProjectArchive.map((project, index) => {
          const repository = getLiveRepository(repositories, project.href);
          const updatedAt = formatUpdatedAt(repository?.updatedAt ?? null, language);
          const description = language === "vi" ? project.description : repository?.description ?? project.description;
          const tags = repository?.topics.length ? repository.topics.slice(0, 4) : project.tags;

          return (
            <li className="archive-card" key={project.href}>
              <div className="archive-card__meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{project.category}</p>
              </div>
              <h3>{project.title}</h3>
              <p>{description}</p>
              <dl className="archive-card__details">
                {repository?.language && <div><dt>{copy.language}</dt><dd>{repository.language}</dd></div>}
                {updatedAt && <div><dt>{copy.updated}</dt><dd>{updatedAt}</dd></div>}
              </dl>
              <ul className="tag-list" aria-label={copy.technologies(project.title)}>
                {tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <a className="text-link" href={project.href} target="_blank" rel="noreferrer">
                {copy.viewRepository} <span aria-hidden="true">↗</span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
