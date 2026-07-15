import { getWorkingPrinciples } from "../content/portfolio-data";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";

export function PrinciplesSection() {
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].principles;
  const workingPrinciples = getWorkingPrinciples(language);

  return (
    <section className="section section--principles" id="principles" aria-labelledby="principles-heading">
      <div className="section-heading">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="principles-heading">{copy.heading}</h2>
      </div>
      <ol className="principle-list">
        {workingPrinciples.map((principle, index) => (
          <li key={principle}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <p>{principle}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
