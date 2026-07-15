import { describe, expect, it } from "vitest";
import { getFocusAreas, getSelectedProjects, profileLinks, selectedProjects } from "./portfolio-data";
import { getPublicProjectArchive, publicProjectArchive } from "./public-project-archive";

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

  it("keeps project identities stable while presenting Vietnamese learning copy", () => {
    const vietnameseSelectedProjects = getSelectedProjects("vi");
    const vietnameseArchive = getPublicProjectArchive("vi");

    expect(getFocusAreas("vi")).toContain("Java & thiết kế hệ thống");
    expect(vietnameseSelectedProjects).toHaveLength(selectedProjects.length);
    expect(vietnameseSelectedProjects.map((project) => project.href)).toEqual(selectedProjects.map((project) => project.href));
    expect(vietnameseSelectedProjects[0]?.description).toContain("Nền tảng giao đồ ăn");
    expect(vietnameseArchive).toHaveLength(publicProjectArchive.length);
    expect(vietnameseArchive.map((project) => project.title)).toEqual(publicProjectArchive.map((project) => project.title));
    expect(vietnameseArchive[5]?.description).toContain("microservice tuyển dụng");
  });
});
