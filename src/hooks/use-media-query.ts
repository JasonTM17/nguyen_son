import { useEffect, useState } from "react";

function getMediaQuery(query: string): MediaQueryList | undefined {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;

  return window.matchMedia(query);
}

function readMediaQuery(query: string): boolean {
  return getMediaQuery(query)?.matches ?? false;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => readMediaQuery(query));

  useEffect(() => {
    const mediaQuery = getMediaQuery(query);
    if (!mediaQuery) return;

    const updateMatches = () => setMatches(mediaQuery.matches);
    updateMatches();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatches);
      return () => mediaQuery.removeEventListener("change", updateMatches);
    }

    mediaQuery.addListener(updateMatches);
    return () => mediaQuery.removeListener(updateMatches);
  }, [query]);

  return matches;
}
