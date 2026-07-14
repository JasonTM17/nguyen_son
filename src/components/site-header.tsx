import type { MotionPreference } from "../hooks/use-motion-preference";
import { MotionPreferenceToggle } from "./motion-preference-toggle";

type SiteHeaderProps = {
  readonly motionPreference: MotionPreference;
};

export function SiteHeader({ motionPreference }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="wordmark" href="#main-content" aria-label="Nguyen Son home">
          nguyen_son
        </a>
        <nav aria-label="Primary navigation" className="site-navigation">
          <a href="#work">Work</a>
          <a href="#archive">Archive</a>
          <a href="#principles">Principles</a>
          <a href="#about">About</a>
        </nav>
        <MotionPreferenceToggle preference={motionPreference} />
      </div>
    </header>
  );
}
