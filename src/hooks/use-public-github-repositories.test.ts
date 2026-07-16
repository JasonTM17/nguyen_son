import { describe, expect, it } from "vitest";
import { normalizeGithubRepository } from "./use-public-github-repositories";

describe("normalizeGithubRepository", () => {
  it("accepts only public owner repository URLs and excludes portfolio metadata", () => {
    expect(normalizeGithubRepository({ html_url: "https://github.com/JasonTM17/JasonTM17", name: "JasonTM17" })).toBeNull();
    expect(normalizeGithubRepository({ html_url: "https://example.com/JasonTM17/FoodDelivery_App", name: "FoodDelivery_App" })).toBeNull();
    expect(normalizeGithubRepository({ fork: true, html_url: "https://github.com/JasonTM17/fork", name: "fork" })).toBeNull();
    expect(normalizeGithubRepository({ disabled: true, html_url: "https://github.com/JasonTM17/disabled", name: "disabled" })).toBeNull();
    expect(normalizeGithubRepository({ private: true, html_url: "https://github.com/JasonTM17/private", name: "private" })).toBeNull();

    expect(normalizeGithubRepository({
      description: "Food delivery",
      html_url: "https://github.com/JasonTM17/FoodDelivery_App",
      language: "TypeScript",
      name: "FoodDelivery_App",
      topics: ["nestjs"],
      updated_at: "2026-07-14T11:21:04Z",
    })).toMatchObject({ href: "https://github.com/JasonTM17/FoodDelivery_App", language: "TypeScript", name: "FoodDelivery_App" });
  });
});
