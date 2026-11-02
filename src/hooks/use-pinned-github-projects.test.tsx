import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import snapshot from "../content/pinned-projects.json";
import { usePinnedGithubProjects, validatePinnedFeed } from "./use-pinned-github-projects";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(snapshot.verifiedAt)); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const reply = (data: unknown) => ({ ok: true, json: async () => data });

describe("pinned feed lifecycle", () => {
  it("loads current pins and reflects pin reorder/removal at the next visible refresh", async () => {
    const changed = { ...snapshot, repositories: snapshot.repositories.slice(1).reverse() };
    const fetchMock = vi.fn().mockResolvedValueOnce(reply(snapshot)).mockResolvedValueOnce(reply(changed)).mockResolvedValueOnce(reply({ ...snapshot, repositories: [] }));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => usePinnedGithubProjects(true));
    await act(async () => {});
    expect(result.current.feed?.repositories).toEqual(snapshot.repositories);
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(result.current.feed?.repositories).toEqual(changed.repositories);
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(result.current.feed?.repositories).toEqual([]);
  });

  it("labels a failed refresh without overwriting last-good data or timestamp", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(reply(snapshot)).mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => usePinnedGithubProjects(true));
    await act(async () => {});
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(result.current.error).toBe(true);
    expect(result.current.feed?.verifiedAt).toBe(snapshot.verifiedAt);
    expect(result.current.feed?.repositories).toEqual(snapshot.repositories);
  });

  it("does not poll hidden tabs, refreshes on return, and removes timers/listeners on unmount", async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(snapshot));
    vi.stubGlobal("fetch", fetchMock);
    const visibility = vi.spyOn(document, "visibilityState", "get");
    visibility.mockReturnValue("hidden");
    const { unmount } = renderHook(() => usePinnedGithubProjects(true));
    await act(async () => {});
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    visibility.mockReturnValue("visible");
    await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const signal = fetchMock.mock.calls[1][1].signal as AbortSignal;
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); window.dispatchEvent(new Event("focus")); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects external URLs, duplicates and malformed timestamps", () => {
    expect(validatePinnedFeed({ ...snapshot, repositories: [{ ...snapshot.repositories[0], href: "https://evil.example/repo" }] })).toBe(false);
    expect(validatePinnedFeed({ ...snapshot, repositories: [snapshot.repositories[0], snapshot.repositories[0]] })).toBe(false);
    expect(validatePinnedFeed({ ...snapshot, verifiedAt: "invalid" })).toBe(false);
  });
});
