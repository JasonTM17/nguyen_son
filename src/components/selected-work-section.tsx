import { usePinnedGithubProjects } from "../hooks/use-pinned-github-projects";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";
import { ProjectPreview } from './project-preview';
import { getProjectPresentation } from "../content/project-presentations";
import { ProjectBrief } from "./project-brief";

export function SelectedWorkSection() {
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].selectedWork;
  const { feed, isLoading, error } = usePinnedGithubProjects();
  const projects = feed?.repositories ?? [];
  const verifiedAt = feed ? new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(feed.verifiedAt)) : "";

  return (
    <section className="section section--work" id="work" aria-labelledby="work-heading">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="work-heading">{copy.heading}</h2>
      </div>
      <div className="selected-work-summary">
        <p className="selected-work-status" role="status">
          {isLoading ? copy.syncLoading : error && feed ? copy.syncFallback(verifiedAt) : error ? copy.syncUnavailable : feed ? copy.syncSuccess(verifiedAt) : copy.syncUnavailable}
        </p>
        <a className="text-link" href="https://github.com/JasonTM17" target="_blank" rel="noreferrer">{copy.viewPins} <span aria-hidden="true">↗</span></a>
      </div>
      {!isLoading && !error && projects.length === 0 && <p className="selected-work-empty">{copy.empty}</p>}
      <div className="project-grid">
        {projects.map((project, index) => {
          const presentation = getProjectPresentation(project.fullName);
          return (
          <article className="project-card" key={project.href}>
            <ProjectPreview repositoryName={project.name} fullName={project.fullName} />
            <div className="project-card__body">
              <div className="project-card__meta">
                <p className="project-card__index" aria-label={copy.projectNumber(index + 1)}>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="project-card__category">{presentation?.category[language] ?? copy.pinnedLabel}</p>
              </div>
              <h3><a href={project.href} target="_blank" rel="noreferrer">{presentation?.title ?? project.name.replace(/[_-]+/g, " ")}</a></h3>
              <small className="project-card__repository">{project.fullName}</small>
              <p>{presentation?.summary[language] ?? (project.description || copy.noDescription)}</p>
              {(presentation?.stack.length || project.language) && <ul className="tag-list" aria-label={copy.technologies(presentation?.title ?? project.name)}>{(presentation?.stack ?? [project.language!]).map((technology) => <li key={technology}>{technology}</li>)}</ul>}
              {presentation && <ProjectBrief project={presentation} />}
              <div className="project-actions">
              <a className="text-link" href={project.href} target="_blank" rel="noreferrer">
                {copy.viewRepository} <span aria-hidden="true">↗</span>
              </a>
              {presentation?.demo && <a className="project-demo" href={presentation.demo} target="_blank" rel="noreferrer">{copy.viewDemo}<span aria-hidden="true">↗</span></a>}
              </div>
            </div>
          </article>
        ); })}
      </div>
    </section>
  );
}
