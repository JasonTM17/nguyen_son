import { describe, expect, it } from "vitest";
import type { PortfolioProject } from "../types/portfolio";
import type { PublicGithubRepository } from "../types/public-github-repository";
import { mergePublicProjectArchive } from "./merge-public-project-archive";

const curatedProject: PortfolioProject = {
  category: "Curated",
  description: "Maintained copy",
  href: "https://github.com/JasonTM17/FoodDelivery_App",
  tags: ["NestJS"],
  title: "FoodFlow",
};

function repository(overrides: Partial<PublicGithubRepository>): PublicGithubRepository {
  return {
    description: null,
    href: "https://github.com/JasonTM17/Horror_Game_Funny",
    language: "GDScript",
    name: "Horror_Game_Funny",
    topics: [],
    updatedAt: "2026-07-15T01:00:00Z",
    ...overrides,
  };
}

describe("mergePublicProjectArchive", () => {
  it("puts newly public repositories before the curated archive", () => {
    const projects = mergePublicProjectArchive(
      [curatedProject],
      [repository({}), repository({ href: curatedProject.href, name: "FoodDelivery_App" })],
      "en",
    );

    expect(projects).toHaveLength(2);
    expect(projects[0]).toMatchObject({
      category: "Public GitHub project",
      href: "https://github.com/JasonTM17/Horror_Game_Funny",
      tags: ["GDScript"],
      title: "Horror Game Funny",
    });
    expect(projects[1]).toBe(curatedProject);
  });

  it("uses localized fallback copy when a new repository has no description", () => {
    const [project] = mergePublicProjectArchive([], [repository({})], "vi");

    expect(project.category).toBe("Dự án GitHub công khai");
    expect(project.description).toContain("dự án học tập mới được công khai");
  });

  it("removes projects that are no longer public after a successful snapshot", () => {
    const projects = mergePublicProjectArchive(
      [curatedProject],
      [repository({})],
      "en",
      true,
    );

    expect(projects.map((project) => project.title)).toEqual(["Horror Game Funny"]);
  });
});
