import type { ProjectPresentation } from "../content/project-presentations";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";

export function ProjectBrief({ project }: { readonly project: ProjectPresentation }) {
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].selectedWork;
  return (
    <details className="project-brief">
      <summary>{copy.details}<span aria-hidden="true">+</span></summary>
      <dl>
        {project.contribution && <div><dt>{language === 'vi' ? 'Phần thực hiện' : 'Contribution'}</dt><dd>{project.contribution[language]}</dd></div>}
        <div><dt>{copy.problem}</dt><dd>{project.problem[language]}</dd></div>
        <div><dt>{copy.implementation}</dt><dd>{project.implementation[language]}</dd></div>
        <div><dt>{copy.outcome}</dt><dd>{project.outcome[language]}</dd></div>
      </dl>
    </details>
  );
}
