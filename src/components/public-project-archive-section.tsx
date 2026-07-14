import { publicProjectArchive } from "../content/public-project-archive";
import { usePublicGithubRepositories } from "../hooks/use-public-github-repositories";
import type { PublicGithubRepository } from "../types/public-github-repository";

function formatUpdatedAt(updatedAt: string | null): string | null {
  if (!updatedAt) return null;
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

function getLiveRepository(
  repositories: readonly PublicGithubRepository[],
  href: string,
): PublicGithubRepository | undefined {
  return repositories.find((repository) => repository.href === href);
}

export function PublicProjectArchiveSection() {
  const { error, isLoading, repositories, syncedAt } = usePublicGithubRepositories();
  const syncedLabel = formatUpdatedAt(syncedAt);

  return (
    <section className="section section--archive" id="archive" aria-labelledby="archive-heading">
      <div className="section-heading">
        <p className="eyebrow">Public project archive</p>
        <h2 id="archive-heading">Nineteen public projects — each one a step in the learning journey.</h2>
      </div>
      <p className="archive-intro">
        The full catalogue stays visible here while GitHub refreshes language, description, and update metadata on page load.
      </p>
      <p className="archive-sync" aria-live="polite">
        {isLoading && "Checking the latest public repository metadata…"}
        {!isLoading && !error && syncedLabel && `Live GitHub metadata synced ${syncedLabel}.`}
        {!isLoading && error && "Showing the verified project archive while live GitHub metadata reconnects."}
      </p>
      <ol className="project-archive">
        {publicProjectArchive.map((project, index) => {
          const repository = getLiveRepository(repositories, project.href);
          const updatedAt = formatUpdatedAt(repository?.updatedAt ?? null);
          const description = repository?.description ?? project.description;
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
                {repository?.language && <div><dt>Language</dt><dd>{repository.language}</dd></div>}
                {updatedAt && <div><dt>Updated</dt><dd>{updatedAt}</dd></div>}
              </dl>
              <ul className="tag-list" aria-label={`${project.title} technologies`}>
                {tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <a className="text-link" href={project.href} target="_blank" rel="noreferrer">
                View repository <span aria-hidden="true">↗</span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
