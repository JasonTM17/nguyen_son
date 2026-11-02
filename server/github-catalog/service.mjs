import snapshot from "../../src/content/public-projects.json" with { type: "json" };
import { createPublicFeedCache } from "../public-feed-cache.mjs";
import { fetchPublicCatalog } from "./profile.mjs";

export const getPublicCatalog = createPublicFeedCache({ fetchFeed: fetchPublicCatalog, initial: snapshot });
