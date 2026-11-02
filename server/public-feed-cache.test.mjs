import { describe, expect, it, vi } from "vitest";
import { createPublicFeedCache } from "./public-feed-cache.mjs";

describe("timestamp-preserving public feed cache", () => {
  it("revalidates on explicit refresh and never reports cached fresh data after that refresh fails", async () => {
    let time = Date.parse("2026-10-31T10:00:00Z");
    const first = { repositories: ["old"], verifiedAt: new Date(time).toISOString(), stale: false };
    const fetchFeed = vi.fn().mockResolvedValueOnce(first).mockImplementationOnce(async () => ({ ...first, repositories: ["new"], verifiedAt: new Date(time).toISOString() })).mockRejectedValueOnce(new Error("offline"));
    const get = createPublicFeedCache({ fetchFeed, now: () => time });
    expect(await get()).toEqual(first);
    time += 1000;
    const second = await get({ refresh: true });
    expect(second.repositories).toEqual(["new"]);
    time += 1000;
    expect(await get({ refresh: true })).toEqual({ ...second, stale: true });
    expect(fetchFeed).toHaveBeenCalledTimes(3);
    expect(await get()).toEqual({ ...second, stale: true });
    expect(await get({ refresh: true })).toEqual({ ...second, stale: true });
    expect(fetchFeed).toHaveBeenCalledTimes(3);
  });
  it("coalesces reads, caches a verified empty result and refreshes after TTL", async () => {
    let time = Date.parse("2026-10-31T10:00:00Z");
    const now = () => time;
    let resolve;
    const empty = { repositories: [], verifiedAt: new Date(time).toISOString(), stale: false };
    const fetchFeed = vi.fn().mockReturnValueOnce(new Promise((done) => { resolve = done; })).mockImplementation(async () => ({ ...empty, repositories: ["new"], verifiedAt: new Date(time).toISOString() }));
    const get = createPublicFeedCache({ now, fetchFeed });
    const first = get();
    expect(get()).toBe(first);
    resolve(empty);
    expect(await first).toEqual(empty);
    time += 59_999;
    expect(await get()).toEqual(empty);
    expect(fetchFeed).toHaveBeenCalledTimes(1);
    time += 1;
    expect((await get()).repositories).toEqual(["new"]);
    expect(fetchFeed).toHaveBeenCalledTimes(2);
  });

  it("never renews saved timestamps and expires at the original 24h boundary", async () => {
    let time = Date.parse("2026-10-31T10:00:00Z");
    const initial = { repositories: ["saved"], verifiedAt: new Date(time).toISOString(), stale: false };
    const fetchFeed = vi.fn(async () => { throw new Error("unavailable"); });
    const get = createPublicFeedCache({ now: () => time, initial, fetchFeed });
    expect(await get()).toEqual({ ...initial, stale: true });
    time += 1000;
    expect((await get()).verifiedAt).toBe(initial.verifiedAt);
    expect(fetchFeed).toHaveBeenCalledTimes(1);
    time = Date.parse(initial.verifiedAt) + 86_400_000;
    expect((await get()).verifiedAt).toBe(initial.verifiedAt);
    time += 1;
    await expect(get()).rejects.toThrow(/unavailable/);
  });

  it("rejects missing, invalid or future recovery data rather than claiming verified empty", async () => {
    for (const initial of [null, { verifiedAt: "invalid" }, { verifiedAt: "2026-11-01T00:00:00Z" }]) {
      const get = createPublicFeedCache({ initial, now: () => Date.parse("2026-10-31T10:00:00Z"), fetchFeed: async () => { throw new Error("offline"); } });
      await expect(get()).rejects.toThrow(/unavailable/);
    }
  });
});
