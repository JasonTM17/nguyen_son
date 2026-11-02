import { describe, expect, it } from "vitest";
import { safeAssistantPins, safeAssistantReferences } from "./portfolio-assistant-references";

const time = Date.parse("2026-10-31T10:00:00Z");
const repo = { name: "HealthCare_Project", fullName: "JasonTM17/HealthCare_Project", href: "https://github.com/JasonTM17/HealthCare_Project", language: "Java" };
const pins = { summary: "Current public pins", verifiedAt: new Date(time).toISOString(), stale: false, source: "https://github.com/JasonTM17", repositories: [repo] };

describe("assistant reference URL boundary", () => {
  it("retains canonical public repo links and only the fixed owner profile, deduplicated", () => {
    expect(safeAssistantReferences([{ title: "HealthCare", href: repo.href }, { title: "duplicate", href: repo.href }, { title: "Public profile", href: pins.source }])).toEqual([{ title: "HealthCare", href: repo.href }, { title: "Public profile", href: pins.source }]);
  });

  it("rejects active schemes, credentials, external hosts, encoded traversal and query redirects", () => {
    for (const href of ["javascript:alert(1)", "data:text/html,evil", "https://github.com.evil.test/JasonTM17/HealthCare_Project", "https://user:pass@github.com/JasonTM17/HealthCare_Project", "https://github.com/JasonTM17/HealthCare_Project?redirect=evil", "https://github.com/JasonTM17/%2e%2e", "https://github.com/JasonTM17/..", "https://github.com/other"]) expect(safeAssistantReferences([{ title: "Click", href }])).toEqual([]);
  });

  it("validates identity, timestamps and uniqueness without blessing forged pin inventory", () => {
    expect(safeAssistantPins(pins, time)).toEqual(pins);
    const foreign = { ...repo, fullName: "other/HealthCare_Project", href: "https://github.com/other/HealthCare_Project" };
    expect(safeAssistantPins({ ...pins, repositories: [repo, foreign] }, time)?.repositories).toHaveLength(2);
    for (const invalid of [{ ...pins, repositories: [{ ...repo, name: "Wrong" }] }, { ...pins, repositories: [repo, repo] }, { ...pins, source: "https://evil.test" }, { ...pins, verifiedAt: new Date(time - 86_400_001).toISOString() }, { ...pins, stale: true, verifiedAt: new Date(time + 1).toISOString() }]) expect(safeAssistantPins(invalid, time)).toBeUndefined();
  });
});
