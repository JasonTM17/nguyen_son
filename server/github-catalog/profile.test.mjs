import { describe, expect, it, vi } from "vitest";
import { fetchPublicCatalog, normalizePublicRepository } from "./profile.mjs";

const repo = { name: "Example", full_name: "JasonTM17/Example", html_url: "https://github.com/JasonTM17/Example", owner: { login: "JasonTM17" }, private: false, fork: false, disabled: false, description: "A public project", language: "Java", topics: ["spring-boot"], updated_at: "2026-10-31T01:00:00Z" };
const page = (items, link) => new Response(JSON.stringify(items), { headers: { "content-type": "application/json", ...(link ? { link } : {}) } });

describe("bounded fixed-owner public catalog", () => {
  it("validates exact identity, excludes private/forks/metadata and bounds public fields", () => {
    expect(normalizePublicRepository(repo)).toMatchObject({ name: "Example", href: repo.html_url });
    for (const overrides of [{ private: true }, { fork: true }, { disabled: true }, { private: undefined }]) expect(normalizePublicRepository({ ...repo, ...overrides })).toBeNull();
    expect(normalizePublicRepository({ ...repo, name: "JasonTM17", full_name: "JasonTM17/JasonTM17", html_url: "https://github.com/JasonTM17/JasonTM17" })).toBeNull();
    for (const overrides of [{ owner: { login: "other" } }, { html_url: "https://github.com/JasonTM17/Example?evil=1" }, { name: ".." }, { full_name: "other/Example" }]) expect(() => normalizePublicRepository({ ...repo, ...overrides })).toThrow();
    expect(normalizePublicRepository({ ...repo, description: "a".repeat(1000), topics: Array.from({ length: 30 }, (_, i) => `topic${i}`) })).toMatchObject({ description: "a".repeat(600), topics: expect.arrayContaining(["topic19"]) });
    expect(normalizePublicRepository({ ...repo, topics: Array.from({ length: 30 }, (_, i) => `topic${i}`) }).topics).toHaveLength(20);
  });

  it("paginates only the fixed endpoint without following untrusted Link URLs", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(page([repo], '<https://evil.test/metadata>; rel="next"')).mockResolvedValueOnce(page([]));
    const result = await fetchPublicCatalog(fetchImpl, () => Date.parse("2026-10-31T02:00:00Z"));
    expect(result.repositories).toHaveLength(1);
    expect(result.verifiedAt).toBe("2026-10-31T02:00:00.000Z");
    expect(fetchImpl.mock.calls[1][0]).toBe("https://api.github.com/users/JasonTM17/repos?type=owner&per_page=100&sort=updated&direction=desc&page=2");
    expect(fetchImpl.mock.calls.every(([, options]) => options.redirect === "error" && options.signal instanceof AbortSignal)).toBe(true);
  });

  it("does not return partial, oversized, duplicate or unbounded catalogs", async () => {
    await expect(fetchPublicCatalog(async () => new Response("x".repeat(2_000_001), { headers: { "content-type": "application/json" } }))).rejects.toThrow();
    await expect(fetchPublicCatalog(async () => page([repo, repo]))).rejects.toThrow(/Duplicate/);
    await expect(fetchPublicCatalog(async () => page([], '<https://evil.test>; rel="next"'))).rejects.toThrow(/pagination/);
    await expect(fetchPublicCatalog(async () => page({ items: [] }))).rejects.toThrow(/page/);
  });
});
