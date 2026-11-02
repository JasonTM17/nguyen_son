import { describe, expect, it, vi } from "vitest";
import { createPinnedProjectService } from "./service.mjs";

const initial = { repositories: [{ name: "saved" }], verifiedAt: "2026-10-30T10:00:00.000Z", source: "https://github.com/JasonTM17", stale: false };
const now = () => Date.parse("2026-10-30T11:00:00.000Z");

describe("pin snapshot recovery", () => {
  it("replaces pins on success, including a verified empty list", async () => {
    const fresh = { ...initial, repositories: [], verifiedAt: new Date(now()).toISOString() };
    const get = createPinnedProjectService({ initial, now, fetchProjects: async () => fresh });
    expect(await get()).toEqual(fresh);
  });

  it("retains the last verification time on failure and stops serving expired fallback", async () => {
    const fail = async () => { throw new Error("upstream denied"); };
    const get = createPinnedProjectService({ initial, now, fetchProjects: fail });
    expect(await get()).toEqual({ ...initial, stale: true });
    await expect(createPinnedProjectService({ initial, fetchProjects: fail, now: () => now() + 25 * 60 * 60 * 1000 })()).rejects.toThrow();
  });

  it("coalesces concurrent reads but allows the next CDN refresh to check changed pins", async () => {
    let resolve;
    const fetchProjects = vi.fn().mockReturnValueOnce(new Promise((done) => { resolve = done; })).mockResolvedValueOnce({ ...initial, repositories: [] });
    const get = createPinnedProjectService({ initial, now, fetchProjects });
    const first = get();
    const second = get();
    expect(first).toBe(second);
    resolve(initial);
    await first;
    expect((await get()).repositories).toEqual([]);
    expect(fetchProjects).toHaveBeenCalledTimes(2);
  });
});
