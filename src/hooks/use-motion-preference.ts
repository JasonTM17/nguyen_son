import { useMemo, useState } from "react";
import { useMediaQuery } from "./use-media-query";

const motionQuery = "(prefers-reduced-motion: reduce)";
const storageKey = "signal-ledger-reduce-motion";

export type MotionPreference = {
  readonly canAdjust: boolean;
  readonly reduceMotion: boolean;
  readonly systemReduced: boolean;
  readonly toggleMotion: () => void;
};

function readStoredPreference(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

function writeStoredPreference(value: boolean): void {
  try {
    window.localStorage.setItem(storageKey, String(value));
  } catch {
    // Storage can be unavailable in private or constrained browsing contexts.
  }
}

export function useMotionPreference(): MotionPreference {
  const systemReduced = useMediaQuery(motionQuery);
  const [userReduced, setUserReduced] = useState(readStoredPreference);

  const reduceMotion = systemReduced || userReduced;

  return useMemo<MotionPreference>(
    () => ({
      canAdjust: !systemReduced,
      reduceMotion,
      systemReduced,
      toggleMotion: () => {
        if (systemReduced) return;

        setUserReduced((currentValue) => {
          const nextValue = !currentValue;
          writeStoredPreference(nextValue);
          return nextValue;
        });
      },
    }),
    [reduceMotion, systemReduced],
  );
}
