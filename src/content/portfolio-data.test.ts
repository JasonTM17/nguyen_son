import { describe, expect, it } from "vitest";
import { profileLinks, selectedProjects } from "./portfolio-data";

describe("portfolio data", () => {
  it("links every selected project to Nguyen Son's verified GitHub account", () => {
    for (const project of selectedProjects) {
      const url = new URL(project.href);

      expect(url.hostname).toBe("github.com");
      expect(url.pathname).toMatch(/^\/JasonTM17\/[A-Za-z0-9_-]+$/);
      expect(project.category.length).toBeGreaterThan(5);
      expect(project.description.length).toBeGreaterThan(40);
      expect(project.tags.length).toBeGreaterThan(1);
    }
  });

  it("keeps the public profile link on the same account", () => {
    expect(profileLinks).toEqual([
      { label: "GitHub", href: "https://github.com/JasonTM17" },
    ]);
  });
});
