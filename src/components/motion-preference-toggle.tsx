import type { MotionPreference } from "../hooks/use-motion-preference";

type MotionPreferenceToggleProps = {
  readonly preference: MotionPreference;
};

export function MotionPreferenceToggle({ preference }: MotionPreferenceToggleProps) {
  const buttonLabel = preference.reduceMotion ? "Motion reduced" : "Reduce motion";
  const description = preference.systemReduced
    ? "Your operating system is reducing motion."
    : "Choose a calmer presentation on this device.";

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
