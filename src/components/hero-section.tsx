import { focusAreas, profileLinks } from "../content/portfolio-data";
import type { MotionPreference } from "../hooks/use-motion-preference";
import { StudioScene } from "./studio-scene";

type HeroSectionProps = {
  readonly motionPreference: MotionPreference;
};

export function HeroSection({ motionPreference }: HeroSectionProps) {
  const githubLink = profileLinks[0];

  return (
    <section className="hero section" aria-labelledby="hero-heading">
      <div className="hero__copy">
        <p className="eyebrow">Software Engineer / DevOps</p>
        <h1 id="hero-heading">
          <span className="hero__name">Nguyen Son</span>
          <span className="hero__statement">Build reliably. Ship deliberately.</span>
        </h1>
        <p className="hero__lede">
          I build practical product systems across web, mobile, real-time services, and applied AI.
          I am continuously learning and welcome thoughtful feedback from the community.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#work">
            Explore selected work
          </a>
          <a className="button button--quiet" href={githubLink.href} target="_blank" rel="noreferrer">
            GitHub profile
          </a>
        </div>
        <ul className="focus-list" aria-label="Focus areas">
          {focusAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
      <div className="hero__visual" aria-hidden="true">
        <StudioScene reduceMotion={motionPreference.reduceMotion} />
      </div>
    </section>
  );
}
