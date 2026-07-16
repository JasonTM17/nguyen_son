import { describe, expect, it } from "vitest";
import { chatQuestionLimit, takeQuestionAllowance } from "./portfolio-assistant-rate-limit.mjs";

describe("portfolio assistant rate limit", () => {
  it("rejects requests after seventy-five questions for one identifier", () => {
    const identifier = `test-${Date.now()}`;
    for (let question = 0; question < chatQuestionLimit; question += 1) {
      expect(takeQuestionAllowance(identifier).allowed).toBe(true);
    }

    expect(takeQuestionAllowance(identifier)).toMatchObject({ allowed: false, remaining: 0 });
  });
});
