import { useEffect, useState } from "react";
import type { PublicGithubRepository } from "../types/public-github-repository";

const CACHE_KEY = "nguyen-son-public-repositories-v1";
const GITHUB_REPOSITORIES_URL = "https://api.github.com/users/JasonTM17/repos?type=owner&per_page=100";
const EXCLUDED_REPOSITORIES = new Set(["JasonTM17", "nguyen_son"]);

type GithubRepositoryResponse = {
  description?: string | null;
  html_url?: string;
  language?: string | null;
  name?: string;
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
    isOwnerRepositoryUrl(repository.href) &&
    !EXCLUDED_REPOSITORIES.has(repository.name) &&
    (repository.description === null || typeof repository.description === "string") &&
    (repository.language === null || typeof repository.language === "string") &&
    (repository.updatedAt === null || typeof repository.updatedAt === "string") &&
    Array.isArray(repository.topics) &&
    repository.topics.every((topic) => typeof topic === "string")
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
    if (!Array.isArray(cached.repositories) || typeof cached.syncedAt !== "string") return null;
    return { repositories: cached.repositories.filter(isPublicGithubRepository), syncedAt: cached.syncedAt };
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

export function usePublicGithubRepositories(): RepositoryFeedState {
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
    if (import.meta.env.MODE === "test") return;

    const controller = new AbortController();

    async function syncRepositories(): Promise<void> {
      try {
        const response = await fetch(GITHUB_REPOSITORIES_URL, {
          headers: { Accept: "application/vnd.github+json" },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("GitHub repository sync failed.");

        const payload = (await response.json()) as GithubRepositoryResponse[];
        const repositories = payload
          .map(normalizeGithubRepository)
          .filter((repository): repository is PublicGithubRepository => repository !== null)
          .sort((left, right) => right.name.localeCompare(left.name));
        const syncedAt = new Date().toISOString();
        writeCachedFeed({ repositories, syncedAt });
        setState({ error: false, isLoading: false, repositories, syncedAt });
      } catch {
        if (!controller.signal.aborted) {
          setState({ error: true, isLoading: false, repositories: [], syncedAt: null });
        }
      }
    }

    void syncRepositories();
    return () => controller.abort();
  }, []);

  return state;
}
