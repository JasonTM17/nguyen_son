import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPinnedProjects } from "./service.mjs";
import handler from "../../api/pinned-projects.mjs";

vi.mock("./service.mjs", () => ({ getPinnedProjects: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

function response() {
  return { headers: {}, statusCode: 0, body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

describe("public pin endpoint", () => {
  it("only accepts GET and never invokes upstream work for other methods", async () => {
    const result = response();
    await handler({ method: "POST" }, result);
    expect(result.statusCode).toBe(405);
    expect(result.headers.Allow).toBe("GET");
    expect(getPinnedProjects).not.toHaveBeenCalled();
  });

  it("serves verified public metadata with a short CDN lifetime and generic failures", async () => {
    const payload = { repositories: [], source: "https://github.com/JasonTM17", verifiedAt: "2026-10-30T10:00:00.000Z", stale: false };
    vi.mocked(getPinnedProjects).mockResolvedValueOnce(payload);
    const fresh = response();
    await handler({ method: "GET" }, fresh);
    expect(fresh.statusCode).toBe(200);
    expect(fresh.body).toEqual(payload);
    expect(fresh.headers["Cache-Control"]).toContain("s-maxage=60");
    vi.mocked(getPinnedProjects).mockRejectedValueOnce(new Error("private provider error"));
    const failed = response();
    await handler({ method: "GET" }, failed);
    expect(failed.statusCode).toBe(503);
    expect(failed.body).toEqual({ error: "Pinned projects are temporarily unavailable" });
    expect(failed.headers["Cache-Control"]).toBe("no-store");
  });
});
