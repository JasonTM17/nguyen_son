import { useEffect, useState } from "react";
import type { PublicGithubRepository } from "../types/public-github-repository";

const CACHE_KEY = "nguyen-son-public-repositories-v3";
const BACKGROUND_SYNC_INTERVAL_MS = 60_000;
const MIN_SYNC_INTERVAL_MS = 30_000;
const MAX_STALE_MS = 24 * 60 * 60 * 1000;
const EXCLUDED_REPOSITORIES = new Set(["JasonTM17", "nguyen_son"]);

type GithubRepositoryResponse = {
  description?: string | null;
  disabled?: boolean;
  fork?: boolean;
  html_url?: string;
  language?: string | null;
  name?: string;
  private?: boolean;
  topics?: string[];
  updated_at?: string | null;
};

type RepositoryFeedState = {
  readonly error: boolean;
  readonly isLoading: boolean;
  readonly repositories: readonly PublicGithubRepository[];
  readonly syncedAt: string | null;
};

type CachedRepositoryFeed = {
  readonly repositories: readonly PublicGithubRepository[];
  readonly syncedAt: string;
};

function isPublicGithubRepository(value: unknown): value is PublicGithubRepository {
  if (!value || typeof value !== "object") return false;
  const repository = value as Partial<PublicGithubRepository>;
  return (
    typeof repository.href === "string" &&
    typeof repository.name === "string" &&
    repository.href === `https://github.com/JasonTM17/${repository.name}` &&
    /^(?!\.{1,2}$)[A-Za-z0-9_.-]{1,100}$/.test(repository.name) &&
    !EXCLUDED_REPOSITORIES.has(repository.name) &&
    (repository.description === null || typeof repository.description === "string" && repository.description.length <= 600) &&
    (repository.language === null || typeof repository.language === "string" && repository.language.length <= 60) &&
    (repository.updatedAt === null || typeof repository.updatedAt === "string") &&
    Array.isArray(repository.topics) &&
    repository.topics.length <= 20 && repository.topics.every((topic) => typeof topic === "string" && topic.length <= 50)
  );
}

function isOwnerRepositoryUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" && url.pathname.startsWith("/JasonTM17/");
  } catch {
    return false;
  }
}

export function normalizeGithubRepository(repository: GithubRepositoryResponse): PublicGithubRepository | null {
  if (
    !repository.name ||
    !repository.html_url ||
    repository.disabled === true ||
    repository.fork === true ||
    repository.private === true ||
    !isOwnerRepositoryUrl(repository.html_url) ||
    EXCLUDED_REPOSITORIES.has(repository.name)
  ) return null;

  return {
    description: repository.description?.trim() || null,
    href: repository.html_url,
    language: repository.language?.trim() || null,
    name: repository.name,
    topics: repository.topics?.filter((topic): topic is string => typeof topic === "string" && topic.length > 0) ?? [],
    updatedAt: repository.updated_at ?? null,
  };
}

function readCachedFeed(): CachedRepositoryFeed | null {
  try {
    const rawValue = window.localStorage.getItem(CACHE_KEY);
    if (!rawValue) return null;
    const cached = JSON.parse(rawValue) as CachedRepositoryFeed;
    if (!Array.isArray(cached.repositories) || cached.repositories.length > 1000 || !recent(cached.syncedAt) || !cached.repositories.every(isPublicGithubRepository)) return null;
    return cached;
  } catch {
    return null;
  }
}

function writeCachedFeed(feed: CachedRepositoryFeed): void {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(feed));
  } catch {
    // The public archive stays useful even when browser storage is unavailable.
  }
}

function recent(timestamp: unknown, clockSkewMs = 0): timestamp is string {
  if (typeof timestamp !== "string") return false;
  const age = Date.now() - Date.parse(timestamp);
  return Number.isFinite(age) && age >= -clockSkewMs && age <= MAX_STALE_MS;
}

export function validatePublicProjectFeed(value: unknown, newlyReceived = false): value is { repositories: PublicGithubRepository[]; verifiedAt: string; stale: boolean; source: string } {
  if (!value || typeof value !== "object") return false;
  const feed = value as { repositories?: unknown; verifiedAt?: unknown; stale?: unknown; source?: unknown };
  // Only a newly received, fresh server response gets a small transport clock-skew
  // tolerance. Persisted or stale recovery data always uses strict original dates.
  const clockSkewMs = newlyReceived && feed.stale === false ? 60_000 : 0;
  if (feed.source !== "https://github.com/JasonTM17?tab=repositories" || typeof feed.stale !== "boolean" || !recent(feed.verifiedAt, clockSkewMs) ||
      !Array.isArray(feed.repositories) || feed.repositories.length > 1000 || !feed.repositories.every(isPublicGithubRepository)) return false;
  return new Set(feed.repositories.map((repo) => repo.name.toLowerCase())).size === feed.repositories.length;
}

export function usePublicGithubRepositories(enabled = import.meta.env.MODE !== "test"): RepositoryFeedState {
  const [state, setState] = useState<RepositoryFeedState>(() => {
    const cachedFeed = typeof window === "undefined" ? null : readCachedFeed();
    return {
      error: false,
      isLoading: true,
      repositories: cachedFeed?.repositories ?? [],
      syncedAt: cachedFeed?.syncedAt ?? null,
    };
  });

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let lastSyncStartedAt = 0;
    let requestInFlight = false;

    async function syncRepositories(): Promise<void> {
      if (requestInFlight) return;
      requestInFlight = true;
      lastSyncStartedAt = Date.now();

      try {
        const response = await fetch("/api/public-projects", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12_000)]) });
        if (!response.ok) throw new Error("Public catalog unavailable");
        const payload: unknown = await response.json();
        if (!validatePublicProjectFeed(payload, true)) throw new Error("Invalid public catalog");
        if (controller.signal.aborted) return;
        const repositories = payload.repositories;
        const syncedAt = payload.verifiedAt;
        writeCachedFeed({ repositories, syncedAt });
        setState({ error: payload.stale, isLoading: false, repositories, syncedAt });
      } catch {
        if (!controller.signal.aborted) {
          setState((current) => ({ error: true, isLoading: false, repositories: recent(current.syncedAt) ? current.repositories : [], syncedAt: recent(current.syncedAt) ? current.syncedAt : null }));
        }
      } finally {
        requestInFlight = false;
      }
    }

    function syncAfterReturning(): void {
      const intervalElapsed = Date.now() - lastSyncStartedAt >= MIN_SYNC_INTERVAL_MS;
      if (document.visibilityState === "visible" && intervalElapsed) void syncRepositories();
    }

    void syncRepositories();
    const intervalId = window.setInterval(() => {
      const intervalElapsed = Date.now() - lastSyncStartedAt >= MIN_SYNC_INTERVAL_MS;
      if (document.visibilityState === "visible" && intervalElapsed) void syncRepositories();
    }, BACKGROUND_SYNC_INTERVAL_MS);
    window.addEventListener("focus", syncAfterReturning);
    document.addEventListener("visibilitychange", syncAfterReturning);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", syncAfterReturning);
      document.removeEventListener("visibilitychange", syncAfterReturning);
    };
  }, [enabled]);

  return state;
}
