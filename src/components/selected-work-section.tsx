import { selectedProjects } from "../content/portfolio-data";

export function SelectedWorkSection() {
  return (
    <section className="section section--work" id="work" aria-labelledby="work-heading">
      <div className="section-heading">
        <p className="eyebrow">Featured learning projects</p>
        <h2 id="work-heading">Four projects that taught me how real workflows fit together.</h2>
      </div>
      <div className="project-grid">
        {selectedProjects.map((project, index) => (
          <article className="project-card" key={project.href}>
            <div className="project-card__meta">
              <p className="project-card__index" aria-label={`Project ${index + 1}`}>
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="project-card__category">{project.category}</p>
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <ul className="tag-list" aria-label={`${project.title} technologies`}>
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <a className="text-link" href={project.href} target="_blank" rel="noreferrer">
              View repository <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
