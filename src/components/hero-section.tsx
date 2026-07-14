import { focusAreas, profileLinks } from "../content/portfolio-data";
import type { MotionPreference } from "../hooks/use-motion-preference";
import { SignalLatticeScene } from "./signal-lattice-scene";

type HeroSectionProps = {
  readonly motionPreference: MotionPreference;
};

export function HeroSection({ motionPreference }: HeroSectionProps) {
  const githubLink = profileLinks[0];

  return (
    <section className="hero section" aria-labelledby="hero-heading">
      <div className="hero__copy">
        <p className="eyebrow">Nguyen Son / product systems</p>
        <h1 id="hero-heading">Ideas travel farther when the systems behind them are deliberate.</h1>
        <p className="hero__lede">
          I build end-to-end experiences across web, mobile, real-time services, and applied AI —
          with the product workflow in view at every layer.
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
        <SignalLatticeScene reduceMotion={motionPreference.reduceMotion} />
      </div>
    </section>
  );
}
