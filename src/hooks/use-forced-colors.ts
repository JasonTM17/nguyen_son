import { useMediaQuery } from "./use-media-query";

const forcedColorsQuery = "(forced-colors: active)";

export function useForcedColors(): boolean {
  return useMediaQuery(forcedColorsQuery);
}
