const DAY_MS = 24 * 60 * 60 * 1000;

// Initial snapshots are recovery data, never a fresh-cache hit before an upstream read.
export function createPublicFeedCache({ fetchFeed, initial = null, now = Date.now, freshMs = 60_000, retryMs = 15_000 }) {
  let lastGood = initial;
  let refreshedAt = -Infinity;
  let retryAt = -Infinity;
  let inFlight;

  const usable = (feed) => {
    const age = now() - Date.parse(feed?.verifiedAt);
    return feed && Number.isFinite(age) && age >= 0 && age <= DAY_MS;
  };
  const fallback = () => {
    if (!usable(lastGood)) throw new Error("Public project data unavailable");
    return { ...lastGood, stale: true };
  };

  return function getFeed({ refresh = false } = {}) {
    if (inFlight) return inFlight;
    if (!refresh && usable(lastGood) && now() - refreshedAt < freshMs) return Promise.resolve(lastGood);
    if (now() < retryAt) return Promise.resolve().then(fallback);
    inFlight = (async () => {
      try {
        const feed = await fetchFeed();
        if (!usable(feed) || feed.stale !== false) throw new Error("Invalid public snapshot");
        lastGood = feed;
        refreshedAt = now();
        return feed;
      } catch {
        refreshedAt = -Infinity;
        retryAt = now() + retryMs;
        return fallback();
      }
    })().finally(() => { inFlight = undefined; });
    return inFlight;
  };
}
