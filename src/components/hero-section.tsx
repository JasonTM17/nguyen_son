import { getFocusAreas, profileLinks } from "../content/portfolio-data";
import type { MotionPreference } from "../hooks/use-motion-preference";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";
import { StudioScene } from "./studio-scene";

type HeroSectionProps = {
  readonly motionPreference: MotionPreference;
};

export function HeroSection({ motionPreference }: HeroSectionProps) {
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].hero;
  const githubLink = profileLinks[0];
  const focusAreas = getFocusAreas(language);

  return (
    <section className="hero section" aria-labelledby="hero-heading">
      <div className="hero__copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="hero-heading">
          <span className="hero__name">Nguyen Son</span>
          <span className="hero__statement">{copy.statement}</span>
        </h1>
        <p className="hero__lede">{copy.lede}</p>
        <div className="hero__actions">
          <a className="button button--primary" href="#work">
            {copy.actions.work}
          </a>
          <a className="button button--quiet" href={githubLink.href} target="_blank" rel="noreferrer">
            {copy.actions.github}
          </a>
        </div>
        <ul className="focus-list" aria-label={copy.focusAreas}>
          {focusAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
      <div className="hero__visual">
        <StudioScene reduceMotion={motionPreference.reduceMotion} />
      </div>
    </section>
  );
}
