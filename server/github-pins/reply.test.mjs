import { describe, expect, it } from "vitest";
import { buildPinnedReply, isPinnedListQuestion } from "./reply.mjs";

const time = Date.parse("2026-10-31T07:00:00Z");
const repo = (name, owner = "JasonTM17") => ({ name, fullName: `${owner}/${name}`, href: `https://github.com/${owner}/${name}`, language: "Java" });
const feed = (repositories = [repo("New_Project")]) => ({ repositories, source: "https://github.com/JasonTM17", verifiedAt: new Date(time).toISOString(), stale: false });

describe("exact source-only pin replies", () => {
  it("detects localized inventory intent while retaining specific explanation requests", () => {
    for (const question of ["GitHub đang ghim những dự án nào?", "Danh sách repo ghim", "Liệt kê các dự án được ghim", "Which projects are pinned?", "Show my current pins", "Pinned projects", "How about listing your pinned repositories?", "How many pins are there?"]) expect(isPinnedListQuestion(question)).toBe(true);
    for (const question of ["Explain the pinned HealthCare architecture", "Giải thích dự án ghim HealthCare", "So sánh hai dự án ghim", "Which Java projects use Kafka?", "What language does the pinned HealthCare_Project use?", "Dự án ghim HealthCare dùng công nghệ gì?", "How are the pinned projects built?"]) expect(isPinnedListQuestion(question)).toBe(false);
  });

  it("preserves source order and distinct foreign owner identities without fabricated descriptions", () => {
    const repositories = [repo("New_Project"), repo("New_Project", "other"), repo("Removed_Previous_Replacement")];
    const result = buildPinnedReply(feed(repositories), "vi", () => time);
    expect(result.pinnedProjects.repositories).toEqual(repositories);
    expect(result.answer).toContain("1. JasonTM17/New_Project\n2. other/New_Project\n3. JasonTM17/Removed_Previous_Replacement");
    expect(result.pinnedProjects.summary).toContain("giờ Việt Nam");
    expect(result.answer).not.toContain("dự án liên quan");
  });

  it("distinguishes empty, stale, unavailable, future and expired feed data", () => {
    expect(buildPinnedReply(feed([]), "vi", () => time).answer).toContain("không có repository");
    const stale = buildPinnedReply({ ...feed(), stale: true }, "en", () => time + 1000);
    expect(stale.answer).toContain("saved list");
    expect(stale.pinnedProjects.verifiedAt).toBe(feed().verifiedAt);
    for (const input of [null, { ...feed(), verifiedAt: "invalid" }, { ...feed(), verifiedAt: new Date(time + 1).toISOString() }, { ...feed(), verifiedAt: new Date(time - 86_400_001).toISOString() }]) {
      const unavailable = buildPinnedReply(input, "en", () => time);
      expect(unavailable.pinnedProjects).toBeUndefined();
      expect(unavailable.answer).toContain("could not verify");
    }
  });

  it("rejects forged URL/name/identity and duplicate records rather than creating clickable claims", () => {
    for (const replacement of [{ href: "javascript:alert(1)" }, { href: "https://github.com.evil.test/JasonTM17/New_Project" }, { href: "https://github.com/JasonTM17/New_Project?next=evil" }, { name: "Different" }, { fullName: "JasonTM17/..", name: "..", href: "https://github.com/JasonTM17/.." }]) {
      const result = buildPinnedReply(feed([{ ...repo("New_Project"), ...replacement }]), "vi", () => time);
      expect(result.pinnedProjects).toBeUndefined();
      expect(result.references).toHaveLength(1);
      expect(result.references[0].href).toBe("https://github.com/JasonTM17");
    }
    expect(buildPinnedReply(feed([repo("Same"), repo("Same")]), "vi", () => time).pinnedProjects).toBeUndefined();
  });
});
