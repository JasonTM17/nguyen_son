import { getPublicCatalog } from "../github-catalog/service.mjs";
import { getPinnedProjects } from "../github-pins/service.mjs";

export async function loadPublicPortfolioContext() {
  // Both services have a total upstream deadline and bounded fallback; failures stay independent.
  const [catalog, pins] = await Promise.allSettled([getPublicCatalog(), getPinnedProjects()]);
  return { catalog: catalog.status === "fulfilled" ? catalog.value : null, pins: pins.status === "fulfilled" ? pins.value : null };
}

export function publicProjectDocuments({ catalog, pins }) {
  const projects = new Map();
  for (const repo of catalog?.repositories ?? []) {
    const fullName = `JasonTM17/${repo.name}`;
    projects.set(fullName, { id: fullName, kind: "project", title: `${repo.name} project`, keywords: `${repo.name.replace(/[_-]/g, " ")} ${repo.language ?? ""} ${repo.topics.join(" ")}`, content: repo.description ?? "", publicData: { ...repo, fullName } });
  }
  for (const repo of pins?.repositories ?? []) {
    const previous = projects.get(repo.fullName);
    projects.set(repo.fullName, { id: repo.fullName, kind: "project", title: `${repo.name} project`, keywords: `${repo.name.replace(/[_-]/g, " ")} ${repo.language ?? ""} ${previous?.keywords ?? ""}`, content: repo.description ?? "", publicData: { ...previous?.publicData, ...repo } });
  }
  return [...projects.values()];
}
