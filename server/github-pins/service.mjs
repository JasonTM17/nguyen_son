import snapshot from "../../src/content/pinned-projects.json" with { type: "json" };
import { fetchPinnedProjects } from "./profile.mjs";
import { createPublicFeedCache } from "../public-feed-cache.mjs";

export function createPinnedProjectService({ fetchProjects = fetchPinnedProjects, now = Date.now, initial = snapshot } = {}) {
  return createPublicFeedCache({ fetchFeed: fetchProjects, initial, now, freshMs: 0 });
}

export const getPinnedProjects = createPublicFeedCache({ fetchFeed: fetchPinnedProjects, initial: snapshot });
