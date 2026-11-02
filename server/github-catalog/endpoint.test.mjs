import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicCatalog } from "./service.mjs";
import handler from "../../api/public-projects.mjs";

vi.mock("./service.mjs", () => ({ getPublicCatalog: vi.fn() }));
beforeEach(() => vi.resetAllMocks());
const response = () => ({ headers: {}, statusCode: 0, body: undefined, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } });

describe("shared public catalog endpoint", () => {
  it("accepts GET only and ignores caller query URLs", async () => {
    const result = response();
    await handler({ method: "POST", query: { url: "http://127.0.0.1" } }, result);
    expect(result.statusCode).toBe(405);
    expect(getPublicCatalog).not.toHaveBeenCalled();
    vi.mocked(getPublicCatalog).mockResolvedValueOnce({ repositories: [], stale: false });
    await handler({ method: "GET", query: { url: "http://127.0.0.1" } }, result);
    expect(getPublicCatalog).toHaveBeenCalledWith();
    expect(result.body.repositories).toEqual([]);
    expect(result.headers["Cache-Control"]).toContain("s-maxage=60");
  });

  it("uses a shorter stale TTL and generic unavailable errors", async () => {
    const result = response();
    vi.mocked(getPublicCatalog).mockResolvedValueOnce({ repositories: [], stale: true });
    await handler({ method: "GET" }, result);
    expect(result.headers["Cache-Control"]).toContain("s-maxage=15");
    vi.mocked(getPublicCatalog).mockRejectedValueOnce(new Error("private provider details"));
    await handler({ method: "GET" }, result);
    expect(result.statusCode).toBe(503);
    expect(result.body).toEqual({ error: "Public projects are temporarily unavailable" });
    expect(result.headers["Cache-Control"]).toBe("no-store");
  });
});
