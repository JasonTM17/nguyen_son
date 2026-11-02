import { act, cleanup, fireEvent, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeGithubRepository, usePublicGithubRepositories, validatePublicProjectFeed } from "./use-public-github-repositories";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); window.localStorage.clear(); });
const normalized = { name: "HealthCare_Project", href: "https://github.com/JasonTM17/HealthCare_Project", description: "Public healthcare learning project", language: "Java", topics: ["spring-boot"], updatedAt: null };
const feed = () => ({ repositories: [normalized], verifiedAt: new Date().toISOString(), source: "https://github.com/JasonTM17?tab=repositories", stale: false });

describe("normalizeGithubRepository", () => {
  it("accepts only public owner repository URLs and excludes portfolio metadata", () => {
    expect(normalizeGithubRepository({ html_url: "https://github.com/JasonTM17/JasonTM17", name: "JasonTM17" })).toBeNull();
    expect(normalizeGithubRepository({ html_url: "https://example.com/JasonTM17/FoodDelivery_App", name: "FoodDelivery_App" })).toBeNull();
    expect(normalizeGithubRepository({ fork: true, html_url: "https://github.com/JasonTM17/fork", name: "fork" })).toBeNull();
    expect(normalizeGithubRepository({ disabled: true, html_url: "https://github.com/JasonTM17/disabled", name: "disabled" })).toBeNull();
    expect(normalizeGithubRepository({ private: true, html_url: "https://github.com/JasonTM17/private", name: "private" })).toBeNull();

    expect(normalizeGithubRepository({
      description: "Food delivery",
      html_url: "https://github.com/JasonTM17/FoodDelivery_App",
      language: "TypeScript",
      name: "FoodDelivery_App",
      topics: ["nestjs"],
      updated_at: "2026-07-14T11:21:04Z",
    })).toMatchObject({ href: "https://github.com/JasonTM17/FoodDelivery_App", language: "TypeScript", name: "FoodDelivery_App" });
  });
});

describe("shared public catalog consumption", () => {
  it("rejects forged identities, duplicate, future and expired snapshots", () => {
    const valid = feed();
    expect(validatePublicProjectFeed(valid)).toBe(true);
    for (const invalid of [{ ...valid, source: "https://evil.test" }, { ...valid, verifiedAt: new Date(Date.now() + 60000).toISOString() }, { ...valid, verifiedAt: new Date(Date.now() - 86_400_001).toISOString() }, { ...valid, repositories: [normalized, normalized] }, { ...valid, repositories: [{ ...normalized, href: normalized.href + "?redirect=evil" }] }]) expect(validatePublicProjectFeed(invalid)).toBe(false);
  });

  it("refreshes through the shared endpoint and preserves stale verification time", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T10:00:00Z"));
    let payload = feed();
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => payload }));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => usePublicGithubRepositories(true));
    await act(async () => {});
    expect(fetchMock).toHaveBeenCalledWith("/api/public-projects", expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(result.current.repositories).toEqual([normalized]);
    const verifiedAt = payload.verifiedAt;
    payload = { ...payload, stale: true };
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(result.current.error).toBe(true);
    expect(result.current.syncedAt).toBe(verifiedAt);
    payload = { ...feed(), repositories: [] };
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(result.current.repositories).toEqual([]);
    expect(result.current.error).toBe(false);
  });

  it("permits bounded clock skew only for a newly received fresh response", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T10:00:00Z"));
    for (const offset of [500, 60_000]) {
      const future = { ...feed(), verifiedAt: new Date(Date.now() + offset).toISOString() };
      expect(validatePublicProjectFeed(future, true)).toBe(true);
      expect(validatePublicProjectFeed(future)).toBe(false);
      expect(validatePublicProjectFeed({ ...future, stale: true }, true)).toBe(false);
    }
    expect(validatePublicProjectFeed({ ...feed(), verifiedAt: new Date(Date.now() + 60_001).toISOString() }, true)).toBe(false);
    expect(validatePublicProjectFeed({ ...feed(), source: "https://evil.test" }, true)).toBe(false);
  });

  it("retains the server timestamp on receipt but never reuses future cache or failure fallback", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-31T10:00:00Z"));
    const future = { ...feed(), verifiedAt: new Date(Date.now() + 60_000).toISOString() };
    window.localStorage.setItem("nguyen-son-public-repositories-v3", JSON.stringify({ repositories: [normalized], syncedAt: future.verifiedAt, stale: false }));
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => future }).mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => usePublicGithubRepositories(true));
    expect(result.current.repositories).toEqual([]);
    await act(async () => {});
    expect(result.current.repositories).toEqual([normalized]);
    expect(result.current.syncedAt).toBe(future.verifiedAt);
    vi.setSystemTime(new Date("2026-10-31T10:00:30Z"));
    await act(async () => { fireEvent.focus(window); });
    expect(result.current.error).toBe(true);
    expect(result.current.repositories).toEqual([]);
    expect(result.current.syncedAt).toBeNull();
  });
});
