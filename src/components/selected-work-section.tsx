import { getSelectedProjects } from "../content/portfolio-data";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";

export function SelectedWorkSection() {
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].selectedWork;
  const selectedProjects = getSelectedProjects(language);

  return (
    <section className="section section--work" id="work" aria-labelledby="work-heading">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="work-heading">{copy.heading}</h2>
      </div>
      <div className="project-grid">
        {selectedProjects.map((project, index) => (
          <article className="project-card" key={project.href}>
            <div className="project-card__meta">
              <p className="project-card__index" aria-label={copy.projectNumber(index + 1)}>
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="project-card__category">{project.category}</p>
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <ul className="tag-list" aria-label={copy.technologies(project.title)}>
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <a className="text-link" href={project.href} target="_blank" rel="noreferrer">
              {copy.viewRepository} <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
