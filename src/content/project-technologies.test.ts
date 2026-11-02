import { describe, expect, it } from "vitest";
import { canonicalTechnology, groupedTechnologies, projectTechnologies } from "./project-technologies";

describe("technology discovery normalization", () => {
  it("merges casing and aliases while retaining exact technology identities", () => {
    expect(projectTechnologies(["java", "Java", "docker", "Docker", "nextjs", "Next.js", "spring-boot", "Spring Boot", "golang", "Go"])).toEqual(["Java", "Docker", "Next.js", "Spring Boot", "Go"]);
    expect(canonicalTechnology("C++")).toBe("C++");
    expect(canonicalTechnology("C")).toBe("C");
    expect(canonicalTechnology("greeting-card")).toBeUndefined();
  });

  it("groups a bounded technology list while leaving broad topics to search", () => {
    const grouped = groupedTechnologies(["java", "Java", "nextjs", "Next.js", "birthday-card", "docker", "postgresql", "PostgreSQL"]);
    expect(grouped).toEqual([{ group: "languages", names: ["Java"] }, { group: "frameworks", names: ["Next.js"] }, { group: "data", names: ["PostgreSQL"] }, { group: "tools", names: ["Docker"] }]);
    expect(grouped.flatMap(({ names }) => names)).not.toContain("birthday-card");
  });
});
