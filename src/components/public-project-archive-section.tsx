import { useRef, useState } from "react";
import { getPublicProjectArchive } from "../content/public-project-archive";
import { mergePublicProjectArchive } from "../content/merge-public-project-archive";
import { usePublicGithubRepositories } from "../hooks/use-public-github-repositories";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";
import type { PublicGithubRepository } from "../types/public-github-repository";
import { getPresentationForHref } from "../content/project-presentations";
import { groupedTechnologies, projectTechnologies } from "../content/project-technologies";
import { ProjectBrief } from "./project-brief";
import { reviewedProjectStack, reviewedProjectSummary } from '../content/project-summaries';

const PROJECT_BATCH_SIZE = 6;

function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/gi, "d").toLocaleLowerCase();
}

function formatUpdatedAt(updatedAt: string | null, language: "en" | "vi"): string | null {
  if (!updatedAt) return null;
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { month: "short", year: "numeric" }).format(date);
}

function formatSyncedAt(syncedAt: string | null, language: "en" | "vi"): string | null {
  if (!syncedAt) return null;
  const date = new Date(syncedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getLiveRepository(
  repositories: readonly PublicGithubRepository[],
  href: string,
): PublicGithubRepository | undefined {
  return repositories.find((repository) => repository.href === href);
}

export function PublicProjectArchiveSection() {
  const [query, setQuery] = useState("");
  const [technology, setTechnology] = useState("");
  const [visibleCount, setVisibleCount] = useState(PROJECT_BATCH_SIZE);
  const searchRef = useRef<HTMLInputElement>(null);
  const { error, isLoading, repositories, syncedAt } = usePublicGithubRepositories();
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].archive;
  const publicProjectArchive = mergePublicProjectArchive(
    getPublicProjectArchive(language),
    repositories,
    language,
    syncedAt !== null,
  );
  const syncedLabel = formatSyncedAt(syncedAt, language);
  const normalizedQuery = normalizeSearch(query.trim());
  const technologies = groupedTechnologies(publicProjectArchive.flatMap((project) => {
    const repository = getLiveRepository(repositories, project.href);
    return [...project.tags, ...(repository?.topics ?? []), ...(repository?.language ? [repository.language] : []), ...reviewedProjectStack(`JasonTM17/${repository?.name}`), ...(getPresentationForHref(project.href)?.stack ?? [])];
  }));
  const matchingProjects = publicProjectArchive.filter((project) => {
    const repository = getLiveRepository(repositories, project.href);
    const presentation = getPresentationForHref(project.href);
    const fullName = repository ? `JasonTM17/${repository.name}` : project.href.replace('https://github.com/', '');
    const matchesTechnology = !technology || projectTechnologies([...project.tags, ...(repository?.topics ?? []), repository?.language ?? "", ...reviewedProjectStack(fullName), ...(presentation?.stack ?? [])]).includes(technology);
    const searchable = [presentation?.title, presentation?.summary[language], reviewedProjectSummary(fullName, language), project.title, project.category, project.description, ...project.tags, repository?.name,
      repository?.description, repository?.language, ...(repository?.topics ?? [])]
      .join(" ");
    return matchesTechnology && normalizeSearch(searchable).includes(normalizedQuery);
  });
  const visibleProjects = matchingProjects.slice(0, visibleCount);
  const remainingCount = matchingProjects.length - visibleProjects.length;
  const hasActiveControls = Boolean(query || technology || visibleCount > PROJECT_BATCH_SIZE);

  function resetArchive(): void {
    setQuery("");
    setTechnology("");
    setVisibleCount(PROJECT_BATCH_SIZE);
    searchRef.current?.focus();
  }

  return (
    <section className="section section--archive" id="archive" aria-labelledby="archive-heading">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="archive-heading">{copy.heading(publicProjectArchive.length)}</h2>
      </div>
      <p className="archive-intro">
        {copy.intro}
      </p>
      <p className="archive-sync" aria-live="polite">
        {isLoading && copy.syncLoading}
        {!isLoading && !error && syncedLabel && copy.syncSuccess(syncedLabel)}
        {!isLoading && error && `${copy.syncFallback}${syncedLabel ? ` · ${syncedLabel}` : ""}`}
      </p>
      <div className="archive-toolbar">
        <label className="archive-search">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
          <span className="sr-only">{copy.searchLabel}</span>
          <input ref={searchRef} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PROJECT_BATCH_SIZE); }} placeholder={copy.searchPlaceholder} />
        </label>
        <div className="archive-filter-actions">
        <label className="archive-filter">
          <span>{copy.filterLabel}</span>
          <select value={technology} onChange={(event) => { setTechnology(event.target.value); setVisibleCount(PROJECT_BATCH_SIZE); }}>
            <option value="">{copy.allTechnologies}</option>
            {technologies.map(({ group, names }) => <optgroup key={group} label={copy.technologyGroups[group]}>{names.map((item) => <option key={item} value={item}>{item}</option>)}</optgroup>)}
          </select>
        </label>
        <div className="archive-reset-slot">
          {hasActiveControls && <button className="archive-reset" onClick={resetArchive} type="button">{copy.reset}</button>}
        </div>
        </div>
      </div>
      <p className="archive-result-count" role="status">{copy.searchResults(visibleProjects.length, matchingProjects.length)}</p>
      {visibleProjects.length === 0 && <p className="archive-empty">{copy.noResults}</p>}
      <ol className="project-archive" id="public-project-list">
        {visibleProjects.map((project) => {
          const repository = getLiveRepository(repositories, project.href);
          const presentation = getPresentationForHref(project.href);
          const updatedAt = formatUpdatedAt(repository?.updatedAt ?? null, language);
          const fullName = repository ? `JasonTM17/${repository.name}` : project.href.replace('https://github.com/', '');
          const description = presentation?.summary[language] ?? reviewedProjectSummary(fullName, language) ?? (language === 'vi' ? 'Repository công khai có mã nguồn và tài liệu dự án trên GitHub.' : 'A public repository with project notes and source code on GitHub.');
          const tags = presentation?.stack ?? projectTechnologies([...reviewedProjectStack(fullName), repository?.language ?? '', ...(repository?.topics ?? []), ...project.tags]).slice(0, 5);

          return (
            <li className="archive-card" key={project.href}>
              <div className="archive-card__meta">
                <span>{String(publicProjectArchive.indexOf(project) + 1).padStart(2, "0")}</span>
                <p>{project.category}</p>
              </div>
              <h3>{presentation?.title ?? project.title}</h3>
              <p>{description}</p>
              <dl className="archive-card__details">
                {repository?.language && <div><dt>{copy.language}</dt><dd>{repository.language}</dd></div>}
                {updatedAt && <div><dt>{copy.updated}</dt><dd>{updatedAt}</dd></div>}
              </dl>
              <ul className="tag-list" aria-label={copy.technologies(project.title)}>
                {tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              {repository?.description && <details className="archive-original"><summary>{language === 'vi' ? 'Mô tả gốc từ GitHub' : 'Original GitHub description'}</summary><p>{repository.description}</p></details>}
              {presentation && <ProjectBrief project={presentation} />}
              <div className="project-actions">
              <a className="text-link" href={project.href} target="_blank" rel="noreferrer">
                {copy.viewRepository} <span aria-hidden="true">↗</span>
              </a>
              {presentation?.demo && <a className="project-demo" href={presentation.demo} target="_blank" rel="noreferrer">{portfolioCopy[language].selectedWork.viewDemo}<span aria-hidden="true">↗</span></a>}
              </div>
            </li>
          );
        })}
      </ol>
      {matchingProjects.length > PROJECT_BATCH_SIZE && (
        <div className="archive-more">
          <button aria-controls="public-project-list" className="button button--quiet" disabled={remainingCount === 0} onClick={() => setVisibleCount((count) => count + PROJECT_BATCH_SIZE)} type="button">
            {remainingCount > 0 ? copy.showMore(Math.min(PROJECT_BATCH_SIZE, remainingCount)) : copy.allShown}
            {remainingCount > 0 && <span aria-hidden="true">↓</span>}
          </button>
        </div>
      )}
    </section>
  );
}
