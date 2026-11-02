import type { PortfolioAssistantPins, PortfolioAssistantReference } from "./portfolio-assistant-types";

const PROFILE = "https://github.com/JasonTM17";
const REPOSITORY = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/(?!\.{1,2}$)[A-Za-z0-9_.-]{1,100}$/;

export function safeAssistantReferences(value: unknown): readonly PortfolioAssistantReference[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 8).flatMap((reference: unknown) => {
    if (!reference || typeof reference !== "object") return [];
    const { title, href } = reference as Partial<PortfolioAssistantReference>;
    if (typeof title !== "string" || !title.trim() || title.length > 160 || typeof href !== "string" || !(href === PROFILE || REPOSITORY.test(href)) || seen.has(href.toLowerCase())) return [];
    seen.add(href.toLowerCase());
    return [{ title, href }];
  });
}

export function safeAssistantPins(value: unknown, now = Date.now()): PortfolioAssistantPins | undefined {
  if (!value || typeof value !== "object") return undefined;
  const pins = value as PortfolioAssistantPins;
  if (pins.source !== PROFILE || typeof pins.summary !== "string" || pins.summary.length > 1200 || typeof pins.stale !== "boolean" ||
      typeof pins.verifiedAt !== "string" || !Array.isArray(pins.repositories) || pins.repositories.length > 6) return undefined;
  const age = now - Date.parse(pins.verifiedAt);
  if (!Number.isFinite(age) || age < (pins.stale ? 0 : -60_000) || age > 86_400_000) return undefined;
  const seen = new Set<string>();
  if (!pins.repositories.every((repo) => {
    if (!repo || typeof repo.fullName !== "string" || typeof repo.href !== "string" || !REPOSITORY.test(repo.href) ||
        repo.href !== `https://github.com/${repo.fullName}` || repo.name !== repo.fullName.split("/")[1] ||
        !(repo.language === null || typeof repo.language === "string" && repo.language.length <= 60) || seen.has(repo.fullName.toLowerCase())) return false;
    seen.add(repo.fullName.toLowerCase());
    return true;
  })) return undefined;
  return pins;
}
