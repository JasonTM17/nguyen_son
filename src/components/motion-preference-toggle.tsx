import type { MotionPreference } from "../hooks/use-motion-preference";
import { portfolioCopy } from "../i18n/portfolio-copy";
import { usePortfolioLanguage } from "../i18n/portfolio-language-context";

type MotionPreferenceToggleProps = {
  readonly preference: MotionPreference;
};

export function MotionPreferenceToggle({ preference }: MotionPreferenceToggleProps) {
  const { language } = usePortfolioLanguage();
  const copy = portfolioCopy[language].motion;
  const buttonLabel = preference.reduceMotion ? copy.reduced : copy.reduce;
  const description = preference.systemReduced
    ? copy.systemDescription
    : copy.calmDescription;

  return (
    <div className="motion-control">
      <button
        aria-describedby="motion-control-description"
        aria-label={buttonLabel}
        aria-pressed={preference.reduceMotion}
        className="motion-control__button"
        data-motion-toggle
        disabled={!preference.canAdjust}
        onClick={preference.toggleMotion}
        type="button"
      >
        {buttonLabel}
      </button>
      <span className="sr-only" id="motion-control-description">
        {description}
      </span>
    </div>
  );
}
