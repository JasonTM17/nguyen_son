import { useEffect, useState } from "react";
import snapshot from "../content/pinned-projects.json";
import type { PinnedProjectFeed } from "../types/pinned-github-project";

const PROFILE_URL = "https://github.com/JasonTM17";
const MAX_STALE_MS = 24 * 60 * 60 * 1000;

export function validatePinnedFeed(value: unknown): value is PinnedProjectFeed {
  if (!value || typeof value !== "object") return false;
  const feed = value as PinnedProjectFeed;
  if (feed.source !== PROFILE_URL || typeof feed.stale !== "boolean" || typeof feed.verifiedAt !== "string" ||
    !Number.isFinite(Date.parse(feed.verifiedAt)) || !Array.isArray(feed.repositories) || feed.repositories.length > 6) return false;
  const seen = new Set<string>();
  return feed.repositories.every((repo) => {
    if (!repo || typeof repo.fullName !== "string" || !/^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(repo.fullName) ||
      repo.name !== repo.fullName.split("/")[1] || repo.href !== `https://github.com/${repo.fullName}` ||
      !(repo.description === null || typeof repo.description === "string" && repo.description.length <= 600) ||
      !(repo.language === null || typeof repo.language === "string" && repo.language.length <= 60) || seen.has(repo.fullName.toLowerCase())) return false;
    seen.add(repo.fullName.toLowerCase());
    return true;
  });
}

function recent(feed: PinnedProjectFeed | null): PinnedProjectFeed | null {
  if (!feed) return null;
  const age = Date.now() - Date.parse(feed.verifiedAt);
  return age >= -60_000 && age <= MAX_STALE_MS ? feed : null;
}

export function usePinnedGithubProjects(enabled = import.meta.env.MODE !== "test") {
  const [state, setState] = useState<{ feed: PinnedProjectFeed | null; isLoading: boolean; error: boolean }>(() => ({
    feed: recent(validatePinnedFeed(snapshot) ? snapshot : null), isLoading: true, error: false,
  }));

  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let inFlight = false;
    let lastStartedAt = 0;
    let activeRequest: AbortController | undefined;

    async function refresh() {
      if (inFlight || disposed) return;
      inFlight = true;
      lastStartedAt = Date.now();
      const controller = new AbortController();
      activeRequest = controller;
      const timeout = window.setTimeout(() => controller.abort(), 12_000);
      try {
        const response = await fetch("/api/pinned-projects", { signal: controller.signal });
        if (!response.ok) throw new Error("Pinned projects unavailable");
        const payload: unknown = await response.json();
        if (!validatePinnedFeed(payload) || !recent(payload)) throw new Error("Invalid pinned project feed");
        if (!disposed) setState({ feed: payload, isLoading: false, error: payload.stale });
      } catch {
        if (!disposed) setState((current) => ({ feed: recent(current.feed), isLoading: false, error: true }));
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
      }
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible" && Date.now() - lastStartedAt >= 30_000) void refresh();
    };
    void refresh();
    const interval = window.setInterval(refreshWhenVisible, 60_000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      disposed = true;
      activeRequest?.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [enabled]);
  return state;
}
