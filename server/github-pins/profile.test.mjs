import { describe, expect, it, vi } from "vitest";
import { fetchPinnedProjects, MAX_HTML_BYTES, parsePinnedRepositories, PROFILE_URL } from "./profile.mjs";
import fixture from "./fixtures/profile.html?raw";

describe("public GitHub pin parser", () => {
  it("extracts current pin identity, descriptions, language and exact displayed order", () => {
    const projects = parsePinnedRepositories(fixture);
    expect(projects.map((project) => project.name)).toEqual([
      "App_AI_powered_waste_sorting", "Ecommerce_BookStore", "JobHunter_SpringBoot_RestfulAPI_React",
      "Laptopshop_Spring_Boot_MVC", "HealthCare_Project", "Student_Management_UTE",
    ]);
    expect(projects[0]).toMatchObject({ href: "https://github.com/JasonTM17/App_AI_powered_waste_sorting", language: "Python" });
    expect(projects[1].description).toContain("bookstore");
  });

  it("does not confuse automatically popular repositories with user pins", () => {
    expect(parsePinnedRepositories(fixture.replace(/Pinned/, "Popular repositories"))).toEqual([]);
    const empty = '<meta name="octolytics-dimension-user_login" content="JasonTM17"><div class="js-pinned-items-reorder-container"><h2>Pinned</h2><ol class="js-pinned-items-reorder-list"></ol></div>';
    expect(parsePinnedRepositories(empty)).toEqual([]);
  });

  it("fails closed for challenges, markup drift, private entries and external URLs", () => {
    expect(() => parsePinnedRepositories("<html>Sign in</html>")).toThrow();
    expect(() => parsePinnedRepositories(fixture.replace(/js-pinned-items-reorder-list/g, "changed-list"))).toThrow();
    expect(() => parsePinnedRepositories(fixture.replace("public source", "private source"))).toThrow();
    expect(() => parsePinnedRepositories(fixture.replace('href="/JasonTM17/App_AI_powered_waste_sorting"', 'href="https://evil.example/owner/repo"'))).toThrow();
    expect(() => parsePinnedRepositories("x".repeat(MAX_HTML_BYTES + 1))).toThrow();
  });

  it("uses one fixed public upstream and verifies only successful bounded HTML", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(fixture, { headers: { "content-type": "text/html" } }));
    const result = await fetchPinnedProjects(fetchMock, () => 1000);
    expect(fetchMock).toHaveBeenCalledWith(PROFILE_URL, expect.objectContaining({ redirect: "error" }));
    expect(result.verifiedAt).toBe("1970-01-01T00:00:01.000Z");
    expect(result.stale).toBe(false);
    await expect(fetchPinnedProjects(async () => new Response("denied", { status: 429 }))).rejects.toThrow();
    await expect(fetchPinnedProjects(async () => new Response("{}", { headers: { "content-type": "application/json" } }))).rejects.toThrow();
  });
});
